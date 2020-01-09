const dotenv = require('dotenv');

dotenv.config();

const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(sinonChai);
chai.use(chaiAsPromised);


const {expect} = chai;

const noticeTable = 'notice';
const userTable = 'user';
const studentTable = 'student';
const table = 'candidature';
const db = require('../../db');
const Candidature = require('../../models/candidature');

const fakeNotice = 'Bando per candidatura';
const fakeUser = {
  email: 'EmailPerCandidatura',
  password: '...',
  name: 'Name',
  surname: 'Surname',
  role: 'Student',
  verified: '1',
};
const fakeStudent = {
  registration_number: 'avc',
  birth_date: '1998-03-04 ',
};

const constCandidature = {
  student: fakeUser.email,
  notice_protocol: fakeNotice,
  state: 'Editable',
  last_edit: '1998-09-04 ',
  documents: [
    {
      student: fakeUser.email,
      notice_protocol: fakeNotice,
      file: '123',
      file_name: `${fakeNotice}${fakeUser.email}`,
    }],
};

describe('Candidature model', function() {
  this.timeout(5000);

  before(async function() {
    await db.query(`INSERT INTO ${noticeTable}(protocol) VALUES(?)`, fakeNotice);
    await db.query(`INSERT INTO ${userTable} SET ?`, fakeUser);
    await db.query(`INSERT INTO ${studentTable}(user_email,registration_number,birth_date) VALUES(?,?,?)`, [fakeUser.email, fakeStudent.registration_number, fakeStudent.birth_date]);
  });

  after(async function() {
    await db.query(`DELETE FROM ${noticeTable} WHERE protocol = ?`, fakeNotice);
    await db.query(`DELETE FROM ${userTable} WHERE email = ?`, fakeUser.email);
  });

  describe('Create method', function() {
    let candidature;

    beforeEach(function() {
      candidature = JSON.parse(JSON.stringify(constCandidature));
    });

    afterEach(async function() {
      candidature = JSON.parse(JSON.stringify(constCandidature));
      await db.query(`DELETE FROM ${table} WHERE student = ? AND notice_protocol = ?`, [candidature.student, candidature.notice_protocol]);
    });

    it('Create_1', async function() {
      await expect(Candidature.create(null)).to.be.rejectedWith(Error, 'Parameter can not be null or undefined');
    });

    it('Create_2', async function() {
      delete candidature.student;
      await expect(Candidature.create(candidature)).to.be.rejectedWith(Error);
    });

    it('Create_3', async function() {
      await expect(Candidature.create(candidature)).to.be.fulfilled;
    });
  });

  describe('Update method', function() {
    let candidature;

    beforeEach(async function() {
      candidature = JSON.parse(JSON.stringify(constCandidature));
      await db.query(`INSERT INTO ${table}(student,notice_protocol,state,last_edit) VALUES(?,?,?,?)`, [candidature.student, candidature.notice_protocol, candidature.state, candidature.last_edit]);
    });

    afterEach(async function() {
      candidature = JSON.parse(JSON.stringify(constCandidature));
      await db.query(`DELETE FROM ${table} WHERE student = ? AND notice_protocol = ?`, [candidature.student, candidature.notice_protocol]);
    });

    it('Update_1', async function() {
      await expect(Candidature.update(null)).to.be.rejectedWith(Error, 'Parameter can not be null or undefined');
    });

    it('Update_2', async function() {
      candidature.student = ',.,';
      await expect(Candidature.update(candidature)).to.be.rejectedWith(Error, 'The candidature doesn\'t exist');
    });

    it('Update_3', async function() {
      await expect(Candidature.update(candidature)).to.be.fulfilled;
    });

    it('Update_4', async function() {
      candidature.documents = null;
      await expect(Candidature.update(candidature)).to.be.fulfilled;
    });
  });

  describe('Remove method', function() {
    let candidature;

    beforeEach(async function() {
      candidature = JSON.parse(JSON.stringify(constCandidature));
      await db.query(`INSERT INTO ${table}(student,notice_protocol,state,last_edit) VALUES(?,?,?,?)`, [candidature.student, candidature.notice_protocol, candidature.state, candidature.last_edit]);
    });

    afterEach(async function() {
      candidature = JSON.parse(JSON.stringify(constCandidature));
      await db.query(`DELETE FROM ${table} WHERE student = ? AND notice_protocol = ?`, [candidature.student, candidature.notice_protocol]);
    });

    it('Remove_1', async function() {
      await expect(Candidature.remove(null)).to.be.rejectedWith(Error, 'Parameter can not be null or undefined');
    });

    it('Remove_2', async function() {
      await expect(Candidature.remove({student: {hey: 'hey'}})).to.be.rejectedWith(Error);
    });

    it('Remove_3', async function() {
      await expect(Candidature.remove(candidature)).to.be.fulfilled;
    });
  });

  describe('Exists method', function() {
    let candidature;

    beforeEach(async function() {
      candidature = JSON.parse(JSON.stringify(constCandidature));
      await db.query(`INSERT INTO ${table}(student,notice_protocol,state,last_edit) VALUES(?,?,?,?)`, [candidature.student, candidature.notice_protocol, candidature.state, candidature.last_edit]);
    });

    afterEach(async function() {
      candidature = JSON.parse(JSON.stringify(constCandidature));
      await db.query(`DELETE FROM ${table} WHERE student = ? AND notice_protocol = ?`, [candidature.student, candidature.notice_protocol]);
    });

    it('Exists_1', async function() {
      await expect(Candidature.exists(null)).to.be.rejectedWith(Error, 'Parameter can not be null or undefined');
    });

    it('Exists_2', async function() {
      await expect(Candidature.exists({student: {hey: 'hey'}})).to.rejectedWith(Error);
    });

    it('Exists_3', async function() {
      await expect(Candidature.exists(candidature)).to.be.fulfilled;
    });
  });

  describe('FindById method', function() {
    let candidature;

    beforeEach(async function() {
      candidature = JSON.parse(JSON.stringify(constCandidature));
      await db.query(`INSERT INTO ${table}(student,notice_protocol,state,last_edit) VALUES(?,?,?,?)`, [candidature.student, candidature.notice_protocol, candidature.state, candidature.last_edit]);
    });

    afterEach(async function() {
      candidature = JSON.parse(JSON.stringify(constCandidature));
      await db.query(`DELETE FROM ${table} WHERE student = ? AND notice_protocol = ?`, [candidature.student, candidature.notice_protocol]);
    });

    it('FindById_1', async function() {
      await expect(Candidature.findById('hey', null)).to.be.rejectedWith(Error, 'Parameters can not be null or undefined');
    });

    it('FindById_2', async function() {
      await expect(Candidature.findById('..', '..')).to.be.rejectedWith(Error, 'No result found: .. and ..');
    });

    it('FindById_3', async function() {
      await expect(Candidature.findById(candidature.student, candidature.notice_protocol)).to.be.fulfilled;
    });
  });

  describe('FindByStudent method', function() {
    let candidature;

    beforeEach(async function() {
      candidature = JSON.parse(JSON.stringify(constCandidature));
      await db.query(`INSERT INTO ${table}(student,notice_protocol,state,last_edit) VALUES(?,?,?,?)`, [candidature.student, candidature.notice_protocol, candidature.state, candidature.last_edit]);
    });

    afterEach(async function() {
      candidature = JSON.parse(JSON.stringify(constCandidature));
      await db.query(`DELETE FROM ${table} WHERE student = ? AND notice_protocol = ?`, [candidature.student, candidature.notice_protocol]);
    });

    it('FindByStudent_1', async function() {
      await expect(Candidature.findByStudent(null)).to.be.rejectedWith(Error, 'Parameter can not be null or undefined');
    });

    it('FindByStudent_2', async function() {
      await expect(Candidature.findByStudent({hey: 'hey'})).to.be.rejectedWith(Error);
    });

    it('FindByStudent_3', async function() {
      await expect(Candidature.findByStudent(candidature.student)).to.be.fulfilled;
    });
  });

  describe('FindByNotice method', function() {
    let candidature;

    beforeEach(async function() {
      candidature = JSON.parse(JSON.stringify(constCandidature));
      await db.query(`INSERT INTO ${table}(student,notice_protocol,state,last_edit) VALUES(?,?,?,?)`, [candidature.student, candidature.notice_protocol, candidature.state, candidature.last_edit]);
    });

    afterEach(async function() {
      candidature = JSON.parse(JSON.stringify(constCandidature));
      await db.query(`DELETE FROM ${table} WHERE student = ? AND notice_protocol = ?`, [candidature.student, candidature.notice_protocol]);
    });

    it('FindByNotice_1', async function() {
      await expect(Candidature.findByNotice(null)).to.be.rejectedWith(Error, 'Parameter can not be null or undefined');
    });

    it('FindByNotice_2', async function() {
      await expect(Candidature.findByNotice({hey: 'hey'})).to.be.rejectedWith(Error);
    });

    it('FindByNotice_3', async function() {
      await expect(Candidature.findByNotice(candidature.notice_protocol)).to.be.fulfilled;
    });
  });

  describe('FindAll method', function() {
    let candidature;

    beforeEach(async function() {
      candidature = JSON.parse(JSON.stringify(constCandidature));
      await db.query(`INSERT INTO ${table}(student,notice_protocol,state,last_edit) VALUES(?,?,?,?)`, [candidature.student, candidature.notice_protocol, candidature.state, candidature.last_edit]);
    });

    afterEach(async function() {
      candidature = JSON.parse(JSON.stringify(constCandidature));
      await db.query(`DELETE FROM ${table} WHERE student = ? AND notice_protocol = ?`, [candidature.student, candidature.notice_protocol]);
    });

    it('FindAll_1', async function() {
      await expect(Candidature.findAll()).to.be.fulfilled;
    });
  });
});