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
      const addDetails = (expected) => {
        const product = products.items.find( (item) => item.id == expected.id && !!item.combo == !!expected.combo )
        if (expected.size && expected.size != 'small') {
          expected.cost = product.cost[expected.size]
          expected.name = `${expected.size == 'large' ? 'Large' : 'Medium'} ${product.name}`
        } else {
          if (isNaN(product.cost)) {
            if (product.cost.half) {
              expected.cost = product.cost['half']
            }
            else {
              expected.cost = product.cost['small']
            }
          } else {
            expected.cost = product.cost
          }
          expected.name = product.name
        }
      }
      addDetails(expected)

      if (expected.modifications) {
        expected.name += ' -'
        for (let modification of expected.modifications) {
          addDetails(modification)
          expected.name += ' ' + modification.name
          if (modification.id == 'waffle_fry') {
            expected.cost += products.waffle_fry_extra_cost
          }
        }
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
      { query: 'combo 1', expected: [{id: 'single', combo: true}], neo: true },
      { query: 'combo 2', expected: [{id: 'double', combo: true}] },
      { query: 'combo 3', expected: [{id: 'triple', combo: true}] },
      { query: 'combo 4', expected: [{id: 'baconator', combo: true}] },
      { query: 'combo 5', expected: [{id: 'bacon_deluxe', combo: true}] },
      { query: 'combo 6', expected: [{id: 'spicy', combo: true}] },
      { query: 'combo 7', expected: [{id: 'homestyle', combo: true}] },
      { query: 'combo 8', expected: [{id: 'asiago_range_chicken_club', combo: true}] },
      { query: 'combo 9', expected: [{id: 'ultimate_chicken_grill', combo: true}] },
      // { query: 'combo 10', expected: ['10_piece_nuggets', combo: true] },
      { query: 'combo 11', expected: [{id: 'premium_cod', combo: true}] },
      { query: 'two combo twos', expected: [{id: 'double', combo: true}, {id: 'double_combo'}] },
      { query: 'strawberry smoothie', expected: [{id: 'strawberry_smoothie'}] },
      { query: 'guava smoothie', expected: [{id: 'guava_smoothie'}] },
      { query: 'mango passion smoothie', expected: [{id: 'mango_passion_smoothie'}] },
      { query: 'wild berry smoothie', expected: [{id: 'wild_berry_smoothie'}] },
      { query: 'strawberry banana smoothie', expected: [{id: 'strawberry_banana_smoothie'}] },
      { query: 'french fries', expected: [{id: 'french_fry'}], sizes: ['small', 'medium', 'large'] },
      { query: 'waffle fries', expected: [{id: 'waffle_fry'}] },
      { query: 'medium waffle fries', expected: [{id: 'waffle_fry', size: 'medium'}] },
      { query: 'large waffle fries', expected: [{id: 'waffle_fry', size: 'large'}] },
      { query: 'combo 1 with waffle fries', expected: [{id: 'single', combo: true, modifications: [{ id: 'waffle_fry' }] }] },
      { query: 'coca cola', expected: [{id: 'coca_cola'}], sizes: ['small', 'medium', 'large'] },
      { query: 'diet coke', expected: [{id: 'diet_coke'}], sizes: ['small', 'medium', 'large'] },
      { query: 'barq', expected: [{id: 'barq'}], sizes: ['small', 'medium', 'large'] },
      { query: 'fanta', expected: [{id: 'fanta'}], sizes: ['small', 'medium', 'large'] },
      { query: 'sprite', expected: [{id: 'sprite'}], sizes: ['small', 'medium', 'large'] },
      { query: 'iced tea', expected: [{id: 'iced_tea'}], sizes: ['small', 'medium', 'large'] },
      { query: 'sweet black coffee', expected: [{id: 'sweet_black_coffee'}], sizes: ['small', 'medium', 'large'] },
      { query: 'french vanilla coffee', expected: [{id: 'french_vanilla_coffee'}], sizes: ['small', 'medium', 'large'] },
      { query: 'cappuccino coffee', expected: [{id: 'cappuccino_coffee'}], sizes: ['small', 'medium', 'large'] },
      { query: 'mocha shake', expected: [{id: 'mocha_shake'}], sizes: ['small', 'medium', 'large'] },
      { query: 'caramel shake', expected: [{id: 'caramel_shake'}], sizes: ['small', 'medium', 'large'] },
      { query: 'lemonade', expected: [{id: 'lemonade'}], sizes: ['small', 'medium', 'large'] },
      { query: 'strawberry lemonade', expected: [{id: 'strawberry_lemonade'}], sizes: ['small', 'medium', 'large'] },
      { query: 'wild berry lemonade', expected: [{id: 'wild_berry_lemonade'}], sizes: ['small', 'medium', 'large'] },
      { query: 'loaded fries', expected: [{id: 'loaded_fry'}] },
      { query: 'chili fries', expected: [{id: 'chili_fry'}] },
      { query: 'garden salad', expected: [{id: 'garden_salad'}] },
      { query: 'caesar salad', expected: [{id: 'caesar_salad'}] },
      { query: 'chili', expected: [{id: 'chili'}], sizes: ['small', 'large'] },
      { query: 'vanilla shake', expected: [{id: 'vanilla_shake'}] },
      { query: 'mango passion shake', expected: [{id: 'mango_passion_shake'}] },
      { query: 'strawberry shake', expected: [{id: 'strawberry_shake'}] },
      { query: 'guava shake', expected: [{id: 'guava_shake'}] },
      { query: 'chocolate shake', expected: [{id: 'chocolate_shake'}] },
      { query: 'banana shake', expected: [{id: 'banana_shake'}] },
      { query: 'wild berry shake', expected: [{id: 'wild_berry_shake'}] },
      { query: 'vanilla frosty', expected: [{id: 'vanilla_frosty'}] },
      { query: 'chocolate frosty', expected: [{id: 'chocolate_frosty'}] },
      { query: 'apple pie', expected: [{id: 'apple_pie'}] },
      { query: 'apple pecan salad', expected: [{id: 'apple_pecan_salad'}] },
      { query: 'spicy caesar salad', expected: [{id: 'spicy_caesar_salad'}] },
      { query: 'taco salad', expected: [{id: 'taco_salad'}] },
      { query: 'southwest avacado salad', expected: [{id: 'southwest_avacado_salad'}] },
      { query: 'breakfast baconator', expected: [{id: 'breakfast_baconator'}] },
      { query: 'french toast sandwich', expected: [{id: 'french_toast_sandwich'}] },
      { query: 'egg muffin', expected: [{id: 'egg_muffin'}] },
      { query: 'chicken on french toast', expected: [{id: 'chicken_on_french_toast'}] },
      { query: 'pancake platter', expected: [{id: 'pancake_platter'}] },
      { query: 'double sausage muffin', expected: [{id: 'double_sausage_muffin'}] },
      { query: 'pancakes', expected: [{id: 'pancake'}] },
      { query: 'french toast', expected: [{id: 'french_toast'}] },
      { query: 'oatmeal', expected: [{id: 'oatmeal'}] },
      { query: 'junior bacon cheeseburger', expected: [{id: 'junior_bacon_cheeseburger', combo: true}] },
      { query: 'junior crispy chicken club', expected: [{id: 'junior_crispy_chicken_club', combo: true}] },
      { query: 'chicken go wrap', expected: [{id: 'chicken_go_wrap', combo: true}] },
      { query: 'broccoli and cheddar potato', expected: [{id: 'broccoli_list_cheddar_potato'}] },
      { query: 'bacon and cheddar potato', expected: [{id: 'bacon_list_cheddar_potato'}] },
      { query: 'hamburger', expected: [{id: 'hamburger'}] },
      { query: 'cheeseburger', expected: [{id: 'cheeseburger', combo: true}] },
      { query: 'crispy chicken', expected: [{id: 'crispy_chicken', combo: true}] },
      { query: '10 piece chicken nuggets', expected: [{id: '10_piece_chicken_nugget'}] },
      { query: '4 piece chicken nuggets', expected: [{id: '4_piece_chicken_nugget', combo: true}] },
      { query: '5 piece chicken nuggets', expected: [{id: '5_piece_chicken_nugget'}] },
      { query: '6 piece chicken nuggets', expected: [{id: '6_piece_chicken_nugget', combo: true}] },
      { query: 'loaded fries', expected: [{id: 'loaded_fry'}] },
      { query: 'chili fries', expected: [{id: 'chili_fry'}] },
  ]
  queries.forEach((query) => {
    let neo = ''
    if (query.neo) {
      neo = 'NEO23'
    }
    test(`${neo}FASTFOOD query "${query.query}"`, async () => {
      await showTest(query)
    }, timeout)
    if (query.sizes) {
      for (let size of query.sizes) {
        const queryStr = `${size} ${query.query}`
        test(`${neo}FASTFOOD query "${queryStr}"`, async () => {
          const squery = {...query, query: queryStr }
          squery.expected.forEach( (expected) => {
            expected.size = size
          })
          console.log('squery', JSON.stringify(squery, null, 2))
          await showTest(squery)
        }, timeout)
      }
    }
  })
});
