const puppeteer = require('puppeteer')
const tests = require('./tests.json')

const URL = process.env.URL || 'http://localhost:10000'
const headless = process.env.HEADLESS !== 'false'
const sloMo = 750
const timeout = 60000

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

describe('tests for menus page', () => {

  let counter
  let page
  let browser;

  beforeAll( async () => {
    browser = await puppeteer.launch({ headless, sloMo });
  }, timeout);

  afterAll( async () => {
    await browser.close()
  }, timeout);

  beforeEach( async () => {
    counter = 0
    page = await browser.newPage();
    await page.goto(`${URL}/menus/`)
    await page.waitForSelector('#query')
  }, timeout)

  afterEach( async () => {
    await page.close()
  }, timeout)

  test(`MENUS test page loads`, async () => {
    await page.waitForSelector('#query')
  }, timeout);

  const query = async (query) => { 
    await page.waitForSelector('#query')
    await page.type('#query', query)
    await page.click('#submit')
    await page.waitForSelector(`#queryCounter${counter+1}`)
    counter += 1
  }

  xtest(`MENUS make everything bold`, async () => {
    await query('make everything bold')
    expect(await isAllTextTagged(page, 'strong')).toBeTruthy()
  }, timeout);

});
