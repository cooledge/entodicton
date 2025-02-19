const puppeteer = require('puppeteer')
const tests = require('./tests.json')

// const URL = 'http://thinktelligence.com'
const URL = process.env.URL || 'http://localhost:10000'
const headless = process.env.HEADLESS !== 'false'
const sloMo = 25
const timeout = 60000

describe('tests for website', () => {
  let browser;
  beforeAll( async () => {
    browser = await puppeteer.launch({ headless, sloMo });
  }, timeout);
  afterAll( async () => {
    await browser.close()
  }, timeout);

  for (let t of tests) {
    test(`DEMO test ${t.query}`, async () => {
      const page = await browser.newPage();

      await page.goto(`${URL}/tankDemo`)
      await page.type('#query', t.query)
      await page.click('#submit')

      await page.waitForSelector('.response')
      const responses = await page.$('.response');
      const content = await page.content()
      for (let e of t.expected) {
        const message = `Did not find '${e}' on the page`
        expect(content.includes(e.toLowerCase()) ? message : '').toBe(message)
      }
      page.close()
    }, timeout);
  }
});
