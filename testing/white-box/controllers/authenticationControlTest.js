// Import dotenv
const dotenv = require('dotenv');

// Configure dotenv
dotenv.config();

const chai = require('chai');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const {expect} = chai;
const proxy = require('proxyquire').noCallThru();

const userStub = require('../../stub/userStub');
const studentStub = require('../../stub/studentStub');
const verifiedEmailStub = require('../../stub/verifiedEmailStub');
const mailStub = require('../../stub/mailStub');

const path = {
  '../models/user': userStub,
  '../models/student': studentStub,
  '../models/verifiedEmail': verifiedEmailStub,
  '../utils/mail': mailStub,
};

const authenticationControl = proxy('../../../controllers/authenticationControl', path);
const {mockRequest, mockResponse} = require('mock-req-res');
let req;
let res;

describe('Authentication control', function() {
  let user;

  describe('Login method', function() {
    beforeEach(function() {
      user = {
        email: 'u.vaccaro@unisa.it',
        password: 'Password123',
        name: 'Ugo',
        surname: 'Vaccaro',
        role: 'Professor',
        verified: '1',
      };
      req = mockRequest({method: 'POST', body: {user: user}});
      res = mockResponse();
    });

    it('Login_1', async function() {
      req = mockRequest({method: 'POST', body: {user: null}});
      await authenticationControl.login(req, res);
      expect(res.status).to.been.calledWith(412);
    });

    it('Login_2', async function() {
      await authenticationControl.login(req, res);
      expect(res.status).to.been.calledWith(200);
    });
  });

  describe('RegisterStudent method', function() {
    it('RegisterStudent_1', async function() {
      req = mockRequest({method: 'POST'});
      res = mockResponse();
      await authenticationControl.registerStudent(req, res);
      expect(res.status).to.been.calledWith(412);
    });
  });

  describe('RegisterProfessor method', function() {
    let user;

    beforeEach(function() {
      user = {
        email: 'u.vaccaro@unisa.it',
        password: 'Password123',
        name: 'Ugo',
        surname: 'Vaccaro',
        role: 'Professor',
        verified: '1',
      };
      req = mockRequest({method: 'POST', body: {professor: user}});
      res = mockResponse();
    });

    it('RegisterProfessor_1', async function() {
      req = mockRequest({method: 'POST'});
      await authenticationControl.registerProfessor(req, res);
      expect(res.status).to.been.calledWith(412);
    });

    it('RegisterProfessor_2', async function() {
      await authenticationControl.registerProfessor(req, res);
      expect(res.status).to.been.calledWith(412);
    });

    it('RegisterProfessor_3', async function() {
      user.email = 'rzizza@unisa.it';
      await authenticationControl.registerProfessor(req, res);
      expect(res.status).to.been.calledWith(200);
    });

    it('RegisterProfessor_4', async function() {
      user.email = 'cattaneo@unisa.it';
      await authenticationControl.registerProfessor(req, res);
      expect(res.status).to.been.calledWith(200);
    });
  });

  describe('InsertVerifiedEmail method', function() {
    it('InserVerifiedEmail_1', async function() {
      req = mockRequest({method: 'POST'});
      res = mockResponse();
      await authenticationControl.insertVerifiedEmail(req, res);
      expect(res.status).to.been.calledWith(412);
    });
  });

  describe('CheckUserSession method', function() {
    it('CheckUserSession_1', async function() {
      req = mockRequest({method: 'GET'});
      res = mockResponse();
      await authenticationControl.checkUserSession(req, res);
      expect(res.status).to.been.calledWith(401);
    });
  });

  describe('Logout method', function() {
    it('Logout_1', async function() {
      req = mockRequest({method: 'GET'});
      res = mockResponse();
      await authenticationControl.logout(req, res);
      expect(res.status).to.been.calledWith(200);
    });
  });
});
