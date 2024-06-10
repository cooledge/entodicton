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
    items = expected.map((expected) => {
      const product = products.items.find( (item) => item.id == expected.id )
      if (expected.size && expected.size != 'small') {
        expected.cost = product.cost[expected.size]
        expected.name = `${expected.size == 'large' ? 'Large' : 'Medium'} ${product.name}`
      } else {
        expected.cost = product.cost['small']
        expected.name = product.name
      }
      return expected
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
      { query: 'combo 1', expected: [{id: 'single_combo'}] },
      { query: 'combo 2', expected: [{id: 'double_combo'}] },
      { query: 'combo 3', expected: [{id: 'triple_combo'}] },
      { query: 'combo 4', expected: [{id: 'baconator_combo'}] },
      { query: 'combo 5', expected: [{id: 'bacon_deluxe_combo'}] },
      { query: 'combo 6', expected: [{id: 'spicy_combo'}] },
      { query: 'combo 7', expected: [{id: 'homestyle_combo'}] },
      { query: 'combo 8', expected: [{id: 'asiago_range_chicken_club_combo'}] },
      { query: 'combo 9', expected: [{id: 'ultimate_chicken_grill_combo'}] },
      // { query: 'combo 10', expected: ['10_piece_nuggets_combo'] },
      { query: 'combo 11', expected: [{id: 'premium_cod_combo'}] },
      { query: 'two combo twos', expected: [{id: 'double_combo'}, {id: 'double_combo'}] },
      { query: 'strawberry smoothie', expected: [{id: 'strawberry_smoothie'}] },
      { query: 'guava smoothie', expected: [{id: 'guava_smoothie'}] },
      { query: 'mango passion smoothie', expected: [{id: 'mango_passion_smoothie'}] },
      { query: 'wild berry smoothie', expected: [{id: 'wild_berry_smoothie'}] },
      { query: 'strawberry banana smoothie', expected: [{id: 'strawberry_banana_smoothie'}] },
      { query: 'french fries', expected: [{id: 'french_fry'}] },
      { query: 'small french fries', expected: [{id: 'french_fry', size: 'small'}] },
      { query: 'medium french fries', expected: [{id: 'french_fry', size: 'medium'}] },
      { query: 'large french fries', expected: [{id: 'french_fry', size: 'large'}] },
      { query: 'waffle fries', expected: [{id: 'waffle_fry'}] },
      { query: 'medium waffle fries', expected: [{id: 'waffle_fry', size: 'medium'}] },
      { query: 'large waffle fries', expected: [{id: 'waffle_fry', size: 'large'}] },
  ]
  queries.forEach((query) => {
    let neo = ''
    if (query.neo) {
      neo = 'NEO23'
    }
    test(`${neo}FASTFOOD query "${query.query}"`, async () => {
      await showTest(query)
    }, timeout)
  })
});
