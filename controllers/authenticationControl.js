/**
 * AuthenticationControl
 *
 * This class represents the Authentication Controller
 *
 * @author Roberto Bruno
 *
 * @todo Finire password recovery e registrazione del professore
 * @copyright 2019 - Copyright by Gang Of Four Eyes
 */
const User = require('../models/user');
const Student = require('../models/student');
const VerifiedEmail = require('../models/verifiedEmail');
const Check = require('../utils/check');
const jwt = require('jsonwebtoken');

const OK_STATUS = 200;
const ERR_CLIENT_STATUS = 412;
const ERR_SERVER_STATUS = 500;
const ERR_NOT_AUTHORIZED = 401;

/**
 * Allows to login
 * @param {Request} req
 * @param {Response} res
 */
exports.login = (req, res) => {
  user = (req.body.user != null) ? new User(req.body.user) : null;
  if (user == null || !Check.checkEmail(user.email) || !Check.checkPassword(user.password)) {
    res.status(ERR_CLIENT_STATUS);
    res.send({
      status: false,
      error: 'Non è stato specificato correttamente l\'User',
    });
    return;
  }
  User.matchUser(user.email, user.password)
      .then((user) => {
        if (user == null) {
          res.status(ERR_NOT_AUTHORIZED);
          res.send({
            status: false,
            error: 'Le credenziali di accesso risultano errate',
          });
        } else {
          payload = {
            id: user.email,
            role: user.role,
          };
          token = createToken(payload);
          res.set('Authorization', token);
          delete user.password;
          res.status(OK_STATUS);
          res.send({
            status: true,
            token: token,
            user: user,
          });
        }
      });
};

/**
 * Allows to logout
 * @param {Request} req
 * @param {Response} res
 */
exports.logout = (req, res) => {
  res.set('Authorization', '');
  res.status(OK_STATUS);
  res.send({
    status: true,
    message: 'Logged out',
  });
};

/**
 * Allows to register a new Student
 * @param {Request} req
 * @param {Response} res
 * @todo Controlliamo anche che non esista ?
 */
exports.registerStudent = (req, res) => {
  student = (req.body.student != null ) ? new Student(req.body.student) : null;
  if (student == null || !Check.checkStudent(student)) {
    res.status(ERR_CLIENT_STATUS);
    res.send({
      status: false,
      error: 'Non è stato specificato correttamente lo Studente',
    });
    return;
  }
  student.role = Student.Role.STUDENT;
  student.verified = 1;
  Student.create(student)
      .then((student) => {
        const payload = {
          id: student.email,
          role: student.role,
        };
        token = createToken(payload);
        res.set('Authorization', token);
        res.status(OK_STATUS);
        res.send({
          token: token,
          student: student,
        });
      })
      .catch((err) => {
        res.status(ERR_SERVER_STATUS);
        res.send({
          error: err,
        });
      });
};

/**
 * Allows to register a new Professor.
 * @param {Request} req
 * @param {Response} res
 * @todo Implementare il meccanismo di iscrizione
 */
exports.registerProfessor = (req, res) => {
  professor = (req.body.professor != null) ? new User(req.body.professor) : null;
  // Bisogna controllare che la sua email sia verificata
  if (professor == null || !Check.checkProfessor(professor)) {
    res.status(ERR_CLIENT_STATUS);
    res.send({
      status: false,
      error: 'Non è stato specificato correttamente il Professore',
    });
    return;
  }
  professor.role = User.Role.PROFESSOR;
  professor.verified = 0;
  VerifiedEmail.isVerified(professor.email)
      .then((exists) => {
        if (exists) {
          User.create(professor)
              .then((professor) => {
              // Bisogna inviare la mail per effettuare il controllo del professore
              // Cosa facciamo se non viene più convalidato ?
              // Permettiamo un operazione per cancellare tutti i non verificati, una sorta di batch ?
              })
              .catch((err) => {
                res.status(ERR_SERVER_STATUS);
                res.send({
                  status: false,
                  error: err.message,
                });
              });
        } else {
          res.send({
            status: false,
            error: 'Email non autorizzata',
          });
        }
      })
      .catch((err) => {
        res.status(ERR_SERVER_STATUS);
        res.send({
          status: false,
          error: err,
        });
      });
};
/**
 * Allows the recovery of the password.
 * @param {Request} req
 * @param {Response} res
 * @todo Implementare il meccanismo di recovery della password
 */
exports.passwordRecovery = (req, res) => {

};

/**
 * Allows to insert a new VerifiedEmail
 * @param {Request} req
 * @param {Response} res
 * @todo Completare con l'aggiunta del model VerifiedEmail e controllare che l'email non esista già
 */
exports.insertVerifiedEmail = (req, res) => {
  email = req.body.email;
  if (email == null || !Check.checkVerifiedEmail(email)) {
    res.status(ERR_CLIENT_STATUS);
    res.send({
      status: false,
      error: 'Non è stata specificata l\'email oppure non rispetta il formato corretto.',
    });
    return;
  }
  const verifiedEmail = new VerifiedEmail({email: email, signed_up: 0});
  VerifiedEmail.create(verifiedEmail)
      .then((result) => {
        res.status(OK_STATUS).send({
          status: true,
          message: 'Email inserita correttamente',
        });
      })
      .catch((err) => {
        res.status(ERR_SERVER_STATUS);
        res.send({
          status: false,
          error: 'Email non inserita',
        });
      });
};

/**
 * Creates a new jwt token
 * @param {Object} payload The payload of the token
 * @return {String} The encrypted token
 */
createToken = (payload) => {
  token = jwt.sign(payload, process.env.PRIVATE_KEY, {expiresIn: '1h'});
  return 'JWT ' + token;
};
