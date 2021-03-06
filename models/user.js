const pool = require('../db');
const bcrypt = require('bcrypt');
const table = 'user';
const SALT = 8;
/**
 * Enum for all possible states of a role
 * @readonly
 * @enum {string}
 */
const Role = {
  STUDENT: 'Student',
  PROFESSOR: 'Professor',
  DDI: 'DDI',
  TEACHING_OFFICE: 'Teaching Office',
};

/**
 * User
 *
 * This class represents an User
 * @author Giannandrea Vicidomini
 *
 * @copyright 2019 - Copyright by Gang Of Four Eyes
 */
class User {
  /**
 * User object constructor
 * @param {User} user The js object containing the fields needed to create User object
 */
  constructor(user) {
    this.email = user.email,
    this.password = user.password,
    this.name = user.name,
    this.surname = user.surname,
    this.role = user.role,
    this.verified = user.verified;
  }

  /** Creates an user
   * @param {User} user The user to create
   * @return {Promise<User>} The promise reresenting the fulfillment of the creation request
   */
  static async create(user) {
    if (user === null || user === undefined) {
      throw new Error('User must not be null');
    }
    user.password = bcrypt.hashSync(user.password, SALT);

    return pool.query(`INSERT INTO ${table} SET ?`, user)
        .then((data) => {
          return new User(user);
        })
        .catch((err) => {
          throw err;
        });
  }
  /** Updates an user
   * @param {User} user The user to update
   * @return {Promise<User>} The promise reresenting the fulfillment of the update request
   */
  static async update(user) {
    if (user === null || user === undefined) {
      throw new Error('User must not be null');
    }
    if (!await this.exists(user)) {
      throw new Error('The user doesn\'t exists');
    }

    let promise;

    if (user.password == null) {
      promise = pool.query(`UPDATE ${table} SET name = ?, surname = ?, role = ?, verified = ? WHERE email = ?`, [user.name, user.surname, user.role, user.verified, user.email]);
    } else {
      user.password = bcrypt.hashSync(user.password, SALT);
      promise = pool.query(`UPDATE ${table} SET ? WHERE email=?`, [user, user.email]);
    }

    return promise
        .then((data) => {
          return new User(user);
        })
        .catch((err) => {
          throw err;
        });
  }

  /** Removes an user
   * @param {User} user The user to remove
   * @return {Promise<boolean>} The promise reresenting the fulfillment of the deletion request
   */
  static async delete(user) {
    if (user === null || user === undefined) {
      throw new Error('User must not be null');
    }

    return pool.query(`DELETE FROM ${table} WHERE email = ?`, user.email)
        .then(([resultSetHeader]) => resultSetHeader.affectedRows > 0)
        .catch((err) => {
          throw err;
        });
  }
  /** Checks if a given user exists
   * @param {User} user The user whose existence is checked
   * @return {Promise<boolean>} The promise reresenting the fulfillment of the verification request
   */
  static async exists(user) {
    if (user === null || user === undefined) {
      throw new Error('User must not be null');
    }

    return pool.query(`SELECT * FROM ${table} WHERE email=?`, user.email)
        .then(([rows]) => rows.length > 0)
        .catch((err) => {
          throw err;
        });
  }
  /** Finds user by email
   * @param {string} email The email used to find the user
   * @return {Promise<User>} The promise reresenting the fulfillment of the search request
   */
  static async findByEmail(email) {
    if (email === null || email === undefined) {
      throw new Error('Email must not be null');
    }

    return pool.query(`SELECT * FROM ${table} WHERE email=?`, email)
        .then(([rows]) => {
          if (rows.length < 1) {
            return null;
          }

          return new User(rows[0]);
        })
        .catch((err) => {
          throw err;
        });
  }
  /** Finds users by role
   * @param {string} role The role used to find the user
   * @return {Promise<User[]>} The promise reresenting the fulfillment of the search request
   */
  static async findByRole(role) {
    if (role === null || role === undefined) {
      throw new Error('Role must not be null');
    }

    return pool.query(`SELECT * FROM ${table} WHERE role=?`, role)
        .then(([rows]) => {
          return rows.map((u) => new User(u));
        })
        .catch((err) => {
          throw err;
        });
  }
  /** Finds user by verified
   * @param {string} verified The state used to find the user
   * @return {Promise<User[]>} The promise reresenting the fulfillment of the search request
   */
  static async findByVerified(verified) {
    if (verified === null || verified === undefined) {
      throw new Error('Verified status must not be null');
    }

    return pool.query(`SELECT * FROM ${table} WHERE verified=?`, verified)
        .then(([rows]) => {
          return rows.map((user) => new User(user));
        })
        .catch((err) => {
          throw err;
        });
  }

  /**
   * Finds all users in the database
   * @return {Promise<User[]>} The promise reresenting the fulfillment of the creation request
  */
  static findAll() {
    return pool.query(`SELECT * FROM ${table}`)
        .then(([rows]) => {
          return rows.map((user) => new User(user));
        })
        .catch((err) => {
          throw err;
        });
  }

  /** Finds user by parameter
   * @param {Object} filter The object containing the logic to use for the search
   * @return {Promise<User[]>} The promise representing the fulfillment of the search request
   */
  static async search(filter) {
    let query = `SELECT * FROM ${table} WHERE true`;
    const params = [];

    if (filter.email) {
      query = `${query} AND email LIKE ?`;
      params.push(filter.email + '%');
    }

    if (filter.name) {
      query = `${query} AND name LIKE ?`;
      params.push(filter.name + '%');
    }

    if (filter.surname) {
      query = `${query} AND surname LIKE ?`;
      params.push(filter.surname + '%');
    }
    if (filter.role) {
      query = `${query} AND role = ?`;
      params.push(filter.role);
    }
    if (filter.verified) {
      query = `${query} AND verified = ?`;
      params.push(filter.verified);
    }

    return pool.query(query, params)
        .then(([rows]) => {
          return rows.map((user) => new User(user));
        })
        .catch((err) => {
          throw err;
        });
  }
  /**
   * Check if exists an User with the email and the password passed.
   * @param {string} email The user email.
   * @param {string} password The password encrypted.
   * @return {Promise<User>} Promise Object that represents the User if there is a match or else it's null.
   */
  static async matchUser(email, password) {
    if (email == null || password == null) {
      throw new Error('Email or Password can not be null or undefined');
    }

    return pool.query(`SELECT * FROM ${table} WHERE email = ? AND verified = 1`, email)
        .then(([rows]) => {
          if (rows.length < 1 || !bcrypt.compareSync(password, rows[0].password)) {
            return null;
          }

          return new User(rows[0]);
        })
        .catch((err) => {
          throw err;
        });
  }
}

User.Role = Role;

module.exports = User;

