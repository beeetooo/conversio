const nock = require('nock');

const Currencio = require('./../../');
const googleConverter = require('./../../lib/google-converter.js');
const validConversionFixture = require('./responses/page.js');
const validExchangeRateFixture = require('./responses/exchange-rate.js');

const API_URL = 'https://www.google.com';

describe('Currencio', () => {
  let convert;
  let getExchangeRate;

  beforeEach(() => {
    const currencio = Currencio(googleConverter);
    convert = currencio.convert;
    getExchangeRate = currencio.getExchangeRate;
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should retrieve a right conversion', (done) => {
    nock(`${API_URL}`)
      .get('/finance/converter')
      .query(true)
      .reply(200, validConversionFixture);

    const expected = { amount: 18, converted: 0.0521, from: 'MXN', to: 'USD' };
    convert({ amount: 18, from: 'MXN', to: 'USD' }, (error, result) => {
      if (error) return done(error);
      expect(result).to.be.deep.equal(expected);
      done();
    });
  });

  it('should fail if result was unsuccessful', (done) => {
    nock(`${API_URL}`)
      .get('/finance/converter')
      .query(true)
      .reply(404, 'INVALID TEXT REGEX WILL NEVER FIND NUMBERS');

    convert({ amount: 18, from: 'MXN', to: 'USD' }, (error, result) => {
      expect(error).to.exist;
      expect(result).to.not.exist;
      expect(error.name).to.be.equal('GOOGLE_API_ERROR');
      done();
    });
  });

  it('should fail if currencies are invalid', (done) => {
    nock(`${API_URL}`)
      .get('/finance/converter')
      .query(true)
      .reply(200, 'INVALID TEXT REGEX WILL NEVER FIND NUMBERS');

    convert({ amount: 18, from: 'JAJASALUDOS', to: 'USD' }, (error, result) => {
      expect(error).to.exist;
      expect(result).to.not.exist;
      expect(error.name).to.be.equal('INVALID_CURRENCY_ERROR');
      done();
    });
  });

  it('should fail if html page has no valid result', (done) => {
    nock(`${API_URL}`)
      .get('/finance/converter')
      .query(true)
      .reply(200, 'INVALID HTML REGEX WILL NEVER FIND NUMBERS');

    convert({ amount: 18, from: 'MXN', to: 'USD' }, (error, result) => {
      expect(error).to.exist;
      expect(result).to.not.exist;
      expect(error.name).to.be.equal('CONVERSION_ERROR');
      done();
    });
  });

  describe('Exchange Rate', () => {
    afterEach(() => {
      nock.cleanAll();
    });

    it('should retrieve a right exchange rate', (done) => {
      nock(`${API_URL}`)
        .get('/finance/converter')
        .query(true)
        .reply(200, validExchangeRateFixture);

      const expected = { amount: 1, converted: 19.2069, from: 'USD', to: 'MXN' };
      getExchangeRate({from: 'USD', to: 'MXN' }, (error, result) => {
        if (error) return done(error);
        expect(result).to.be.deep.equal(expected);
        done();
      });
    });

    it('should fail if result was unsuccessful', (done) => {
      nock(`${API_URL}`)
        .get('/finance/converter')
        .query(true)
        .reply(404, 'INVALID TEXT REGEX WILL NEVER FIND NUMBERS');

      getExchangeRate({ amount: 18, from: 'MXN', to: 'USD' }, (error, result) => {
        expect(error).to.exist;
        expect(result).to.not.exist;
        expect(error.name).to.be.equal('GOOGLE_API_ERROR');
        done();
      });
    });

    it('should fail if currencies are invalid', (done) => {
      nock(`${API_URL}`)
        .get('/finance/converter')
        .query(true)
        .reply(200, 'INVALID TEXT REGEX WILL NEVER FIND NUMBERS');

      getExchangeRate({ amount: 18, from: 'JAJASALUDOS', to: 'USD' }, (error, result) => {
        expect(error).to.exist;
        expect(result).to.not.exist;
        expect(error.name).to.be.equal('INVALID_CURRENCY_ERROR');
        done();
      });
    });

    it('should fail if html page has no valid result', (done) => {
      nock(`${API_URL}`)
        .get('/finance/converter')
        .query(true)
        .reply(200, 'INVALID HTML REGEX WILL NEVER FIND NUMBERS');

      getExchangeRate({ amount: 18, from: 'MXN', to: 'USD' }, (error, result) => {
        expect(error).to.exist;
        expect(result).to.not.exist;
        expect(error.name).to.be.equal('CONVERSION_ERROR');
        done();
      });
    });
  });
});
