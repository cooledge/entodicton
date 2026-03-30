const puppeteer = require('puppeteer')

const headless = process.env.HEADLESS !== 'false'
const sloMo = 750
const timeout = 60000

describe('start puppeteer', () => {
  test(`STARTPUPPETEER`, async () => {
    // for automated tests to get puppeteer going before running the tests for real
    const browser = await puppeteer.launch({ headless, sloMo });
    await browser.close();
  }, timeout * 3);
})
