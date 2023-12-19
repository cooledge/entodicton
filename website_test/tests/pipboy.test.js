const puppeteer = require('puppeteer')
const tests = require('./tests.json')
const character = require('../../pipboy/src/character.json')

// const URL = 'http://thinktelligence.com'
const URL = process.env.URL || 'http://localhost:10000'
const headless = process.env.HEADLESS !== 'false'
const sloMo = 750
const timeout = 60000

describe('tests for pipboy page', () => {

  let browser;
  beforeAll( async () => {
    browser = await puppeteer.launch({ headless, sloMo });
  });
  afterAll( async () => {
    await browser.close()
  });

  test(`test page loads`, async () => {
    const page = await browser.newPage();

    await page.goto(`${URL}/pipboy`)
    await page.waitForSelector('#query')
    page.close()
  }, timeout);

  test(`show the weapons`, async () => {
    const page = await browser.newPage();

    await page.goto(`${URL}/pipboy`)
    await page.waitForSelector('#query')
    await page.type('#query', 'show the weapons')
    await page.click('#submit')
    for (let item of character.weapons) {
      await page.waitForSelector(`#${item.id}`)
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
    page.close()
  }, timeout);

  test(`show the apparel`, async () => {
    const page = await browser.newPage();

    await page.goto(`${URL}/pipboy`)
    await page.waitForSelector('#query')
    await page.type('#query', 'show the apparel')
    await page.click('#submit')
    for (let item of character.apparel) {
      await page.waitForSelector(`#${item.id}`)
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
    page.close()
  }, timeout);

  test(`show the aid`, async () => {
    const page = await browser.newPage();

    await page.goto(`${URL}/pipboy`)
    await page.waitForSelector('#query')
    await page.type('#query', 'show the aid')
    await page.click('#submit')
    for (let item of character.aid) {
      await page.waitForSelector(`#${item.id}`)
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
    page.close()
  }, timeout);

  const testMovements = async (queries, item, selector='.current') => {
    const page = await browser.newPage();

    await page.goto(`${URL}/pipboy`)
    await page.waitForSelector('#query')
    for (let query of queries) {
      await page.type('#query', query)
      await page.click('#submit')
      await new Promise(resolve => setTimeout(resolve, 250))
    }

    await page.waitForSelector(selector)
    const li = await page.$(`#${item.id}`)
    const text = await (await li.getProperty('textContent')).jsonValue()
    const quantity = item.quantity > 1 ? `(${item.quantity})` : '';
    expect(text).toBe(`${item.name}${quantity}`)
    await new Promise(resolve => setTimeout(resolve, 5000))
    page.close()
  }

  test(`ONE23 select first`, async () => {
    const queries = ['show the weapons', 'select']
    const item = character.weapons[0]
    await testMovements(queries, item)
  }, timeout);

  test(`select second`, async () => {
    const queries = ['show the weapons', 'down', 'select']
    const item = character.weapons[1]
    await testMovements(queries, item)
    await new Promise(resolve => setTimeout(resolve, 5000))
  }, timeout);

  test(`move down`, async () => {
    const queries = ['show the weapons', 'move down']
    const item = character.weapons[1]
    await testMovements(queries, item)
  }, timeout);

  test(`down`, async () => {
    const queries = ['show the weapons', 'down']
    const item = character.weapons[1]
    await testMovements(queries, item)
  }, timeout);

  test(`down 2`, async () => {
    const queries = ['show the weapons', 'down 2']
    const item = character.weapons[2]
    await testMovements(queries, item)
  }, timeout);

  test(`move up 2`, async () => {
    const queries = ['show the weapons', 'down 3', 'up 2']
    const item = character.weapons[1]
    await testMovements(queries, item)
  }, timeout);

  xtest(`outfits`, async () => {
    const page = await browser.newPage();

    await page.goto(`${URL}/pipboy`)
    await page.waitForSelector('#query')
    for (let query of queries) {
      await page.type('#query', query)
      await page.click('#submit')
      await new Promise(resolve => setTimeout(resolve, 250))
    }

    await page.waitForSelector('.current')
    const li = await page.$(`#${item.id}`)
    const text = await (await li.getProperty('textContent')).jsonValue()
    const quantity = item.quantity > 1 ? `(${item.quantity})` : '';
    expect(text).toBe(`${item.name}${quantity}`)
    // await new Promise(resolve => setTimeout(resolve, 5000))
    page.close()
  }, timeout);
});
