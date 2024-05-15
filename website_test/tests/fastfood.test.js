const puppeteer = require('puppeteer')
const tests = require('./tests.json')
const products = require('../../fastfood/src/products.json')

const URL = process.env.URL || 'http://localhost:10000'
const headless = process.env.HEADLESS !== 'false'
const sloMo = 750
const timeout = 60000

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

describe('tests for fastfood page', () => {

  let browser

  beforeAll( async () => {
    browser = await puppeteer.launch({ headless, sloMo });
  })

  afterAll( async () => {
    await browser.close()
  })

  test(`FASTFOOD test page loads`, async () => {
    const page = await browser.newPage();

    await page.goto(`${URL}/fastfood/`)

    await page.waitForSelector('#query')
    page.close()
  }, timeout)

  async function showTest({query, expected}) {
    items = expected.map((id) => {
      return products.items.find( (item) => item.id == id )
    })
    let sum = 0
    items.forEach( (item) => sum += item.cost )
    const items_total = `$${sum}`

    const page = await browser.newPage();

    await page.goto(`${URL}/fastfood/`)

    await page.waitForSelector('#query')
    await page.type('#query', query)
    await page.click('#submit')
    await page.waitForSelector(`.Cost`)

    let counter = 1
    for (let item of items) {
      const name = await page.evaluate((selector) => { return document.querySelector(selector).textContent; }, `.Items > li:nth-child(${counter}) .Name`)
      const cost = await page.evaluate((selector) => { return document.querySelector(selector).textContent; }, `.Items > li:nth-child(${counter}) .Cost`)
      expect(name).toBe(item.name)
      expect(cost).toBe(`$${item.cost}`)
      counter += 1
    }
    const total = await page.evaluate((selector) => { return document.querySelector(selector).textContent; }, `.Items > li:nth-child(${counter}) .Total`)
    expect(total).toBe(items_total)
    await page.close()
  }
  
  const queries = [
      { query: 'combo 1', expected: ['single_combo'] },
      { query: 'combo 2', expected: ['double_combo'] },
      { query: 'combo 3', expected: ['triple_combo'] },
      { query: 'combo 4', expected: ['baconator_combo'] },
      { query: 'combo 5', expected: ['bacon_deluxe_combo'] },
      { query: 'combo 6', expected: ['spicy_combo'] },
      { query: 'combo 7', expected: ['homestyle_combo'] },
      { query: 'combo 8', expected: ['asiago_range_chicken_club_combo'] },
      { query: 'combo 9', expected: ['ultimate_chicken_grill_combo'] },
      { query: 'combo 10', expected: ['10_piece_nuggets_combo'] },
      { query: 'combo 11', expected: ['premium_cod_combo'] },
      { query: 'two combo twos', expected: ['double_combo', 'double_combo'] },
  ]
  queries.forEach((query) => {
    test(`FASTFOOD query "${query.query}"`, async () => {
      await showTest(query)
    }, timeout)
  })
});
