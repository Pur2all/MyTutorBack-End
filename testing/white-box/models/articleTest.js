const dotenv = require('dotenv');

dotenv.config();

const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(sinonChai);
chai.use(chaiAsPromised);


const {expect} = chai;

const Article = require('../../../models/article');
const Notice = require('../../../models/notice');
const exampleNotice = require('./exampleNotices.json');

const noticeConst = JSON.parse(JSON.stringify(exampleNotice.notice));

const articleConst = {
  notice_protocol: noticeConst.protocol,
  text: 'lo Statuto dell\'Università degli Studi di Salerno; VISTO l\'art. 13 del Regolamento UE 2016/679 - Regolamento Generale sulla Protezione dei Dati;',
  initial: 'VISTO',
};

describe('Article model', function() {
  this.timeout(5000);

  let article;

  before(async function() {
    article = JSON.parse(JSON.stringify(articleConst));
    noticeConst.articles = null;

    await Notice.create(noticeConst);
  });

  after(async function() {
    await Notice.remove(noticeConst);
  });

  describe('Create method', function() {
    after(async function() {
      await Article.remove(article);
    });

    it('Create_1', function() {
      return expect(Article.create(null)).to.be.rejectedWith(Error, /null/);
    });

    it('Create_2', function() {
      return expect(Article.create(article)).to.be.fulfilled;
    });
  });

  describe('Update method', function() {
    before(async function() {
      article = await Article.create(article);
    });

    after(async function() {
      await Article.remove(article);
    });

    it('Update_1', function() {
      return expect(Article.update(null)).to.be.rejectedWith(Error, /null/);
    });

    it('Update_2', function() {
      const tempArticle = JSON.parse(JSON.stringify(article));

      tempArticle.id = 9999999;

      return expect(Article.update(tempArticle)).to.be.rejectedWith(Error, /doesn't exists/);
    });

    it('Update_3', function() {
      return expect(Article.update(article)).to.be.fulfilled;
    });
  });

  describe('Remove method', function() {
    before(async function() {
      article = await Article.create(article);
    });

    it('Remove_1', function() {
      return expect(Article.remove(null)).to.be.rejectedWith(Error, /null/);
    });

    it('Remove_2', function() {
      return expect(Article.remove(article)).to.be.fulfilled;
    });
  });

  describe('Exists method', function() {
    it('Exists_1', function() {
      return expect(Article.exists(null)).to.be.rejectedWith(Error, /null/);
    });

    it('Exists_2', function() {
      return expect(Article.exists(article)).to.be.fulfilled;
    });
  });

  describe('FindById method', function() {
    before(async function() {
      article = await Article.create(article);
    });

    it('FindById_1', function() {
      return expect(Article.findById(null, null)).to.be.rejectedWith(Error, /null/);
    });

    it('FindById_2', function() {
      return expect(Article.findById('lalala', 'lelele')).to.be.rejectedWith(Error, /No result/);
    });

    it('FindById_3', function() {
      return expect(Article.findById(article.id, article.notice_protocol)).to.be.fulfilled;
    });
  });

  describe('FindByNotice method', function() {
    it('FindByNotice_1', function() {
      return expect(Article.findByNotice(null)).to.be.rejectedWith(Error, /null/);
    });

    it('FindByNotice_2', function() {
      return expect(Article.findByNotice(article.notice_protocol)).to.be.fulfilled;
    });
  });

  describe('FindAll method', function() {
    it('FindAll_1', function() {
      return expect(Article.findAll()).to.be.fulfilled;
    });
  });
});
