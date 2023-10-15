const puppeteer = require('puppeteer')
const tests = require('./tests.json')

// const URL = 'http://thinktelligence.com'
const URL = 'http://localhost:10000'
const headless = process.env.HEADLESS !== 'false'
const sloMo = 50
const timeout = 30000

describe('tests for website', () => {
  let browser;
  beforeAll( async () => {
    browser = await puppeteer.launch({ headless, sloMo });
  });
  afterAll( async () => {
    await browser.close()
  });

  for (let t of tests) {
    test(`test ${t.query}`, async () => {
      const page = await browser.newPage();

      // Navigate the page to a URL
      await page.goto(`${URL}/tankDemo`)
      await page.type('#query', t.query)
      await page.click('#submit')

      /*
      await page.focus('#query');
      await page.keyboard.down('Control');
      await page.keyboard.press('A');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');
      */

      await page.waitForSelector('.response')
      const responses = await page.$('.response');
      const content = await page.content()
      for (let e of t.expected) {
        const message = `Did not find '${e}' on the page`
        expect(content.includes(e.toLowerCase()) ? message : '').toBe(message)
      }
    }, timeout);
  }
});
