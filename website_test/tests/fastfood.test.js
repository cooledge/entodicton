const puppeteer = require('puppeteer')
const tests = require('./tests.json')
const products = require('../../fastfood/src/products.json')
const DemoWriter = require('./demoWriter')

const demoWriter = new DemoWriter('../fastfood/src/demo.json', true)

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
  let page;
  let counter = 0;

  beforeEach( async () => {
    counter = 0
    page = await browser.newPage();
    await page.goto(`${URL}/fastfood/`)
    await page.waitForSelector('#query')
    demoWriter.startTest()
  }, timeout);

  afterEach( async () => {
    await page.close()
    demoWriter.endTest()
  }, timeout)

  beforeAll( async () => {
    browser = await puppeteer.launch({ headless, sloMo });
  }, timeout)

  afterAll( async () => {
    await browser.close()
    if (!process.env.NO_DEMOS) {
      demoWriter.write()
    }
  }, timeout)

  const doQuery = async (query) => {
    demoWriter.add(query)
    await page.waitForSelector('#query')
    await page.type('#query', query)
    await page.click('#submit')
    await page.waitForSelector(`#queryCounter${counter+1}`)
    counter += 1
  }

  test(`FASTFOOD test page loads`, async () => {
    await page.goto(`${URL}/fastfood/`)
    await page.waitForSelector('#query')
  }, timeout)

  async function showTest({queries, expecteds}) {
    const getItems = (expected) => {
      return expected.map((expected) => {
        const addDetails = (expected) => {
          const product = products.items.find( (item) => item.id == expected.id && !!item.combo == !!expected.combo )
          if (!product) {
            console.log('not found ------------', JSON.stringify(expected, null, 2))
          }
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
    }

    for (let i = 0; i < queries.length; ++i) {
      const query = queries[i]
      const expected = expecteds[i]
      await doQuery(query)
      // await page.click('#submit')
      if (expected.find((e) => e.query)) {
        const query = expected[0].query
        await page.waitForSelector(`.message`)
        const message = await page.evaluate((selector) => { return document.querySelector(selector).textContent; }, '.message')
        expect(message.trim()).toBe(query)
      } else if (expected.length == 0) {
        // expected the unexpected
      } else {
        const test = async () => {
          await page.waitForSelector(`.Cost`)

          const items = getItems(expected)

          if (items.length == 0) {
            const nTries = 5
            for (let nTry = 0; nTry < nTries; ++nTry) {
              await sleep(200)
              const items = await page.evaluate((selector) => { return document.querySelector(selector).textContent; }, `.Items`)
              if (items == '' || nTry+1 == nTries) {
                expect(items).toBe('')
                break
              }
            }
          }

          let sum = 0
          items.forEach( (item) => sum += item.cost )
          const items_total = `$${sum}`

          let counter = 1
          for (let item of items) {
            console.log('item', JSON.stringify(item))
            const nTries = 3;
            for (let nTry = 0; nTry < nTries; ++nTry) {
              const name = await page.evaluate((selector) => { return document.querySelector(selector).textContent; }, `.Items > li:nth-child(${counter}) .Name`)
              const cost = await page.evaluate((selector) => { return document.querySelector(selector).textContent; }, `.Items > li:nth-child(${counter}) .Cost`)
              let expectedName = item.name
              if (item?.modifiers?.length == 1) {
                if (item.modifiers[0].id == 'sprite') {
                  if (item?.modifications?.length == 1) {
                    expectedName = 'Single Combo - Waffle Fries, Sprite'
                  } else {
                    expectedName += ' - Sprite'
                  }
                }
              }
              try {
                expect(name).toBe(expectedName)
                expect(cost).toBe(`$${item.cost}`)
              } catch( e ) {
                if (nTry + 1 == nTries) {
                  throw e
                }
                console.log('--------------- doing the retry -----------')
                await sleep(1000)
              }
              // await sleep(1000)
            }
            counter += 1
          }
          const total = await page.evaluate((selector) => { return document.querySelector(selector).textContent; }, `.Items > li:nth-child(${counter}) .Total`)
          expect(total).toBe(items_total)
        }
        // account for lag in the update for change queries

        const nTries = 5
        for (let nTry = 0; nTry < nTries; ++nTry) {
          try {
            await test()
            break
          } catch( e ) {
            if (nTry + 1 == nTries) {
              throw e
            }
            await sleep(200)
          }
        }
      }
    }
  }
 
  const withAndWithoutDrink = ({query, expected, neo}) => {
    const queries = []
    queries.push({ queries: [query], neo, expecteds: [[expected]] })
    queries.push({ queries: [query, 'sprite'], neo, expecteds: [[expected], [{...expected, modifiers: (expected.modifiers || []).concat([{ id: 'sprite' }])}]] })
    return queries
  }
  const queries = [
      ...withAndWithoutDrink({query: 'combo 1', expected: {id: 'single', combo: true}}),
      ...withAndWithoutDrink({query: 'combo 2', expected: {id: 'double', combo: true}}),
      ...withAndWithoutDrink({query: 'combo 3', expected: {id: 'triple', combo: true}}),
      ...withAndWithoutDrink({query: 'combo 4', expected: {id: 'baconator', combo: true}}),
      ...withAndWithoutDrink({query: 'combo 5', expected: {id: 'bacon_deluxe', combo: true}}),
      ...withAndWithoutDrink({query: 'combo 6', expected: {id: 'spicy', combo: true}}),
      ...withAndWithoutDrink({query: 'combo 7', expected: {id: 'homestyle', combo: true}}),
      ...withAndWithoutDrink({query: 'combo 8', expected: {id: 'asiago_range_chicken_club', combo: true}}),
      ...withAndWithoutDrink({query: 'combo 9', expected: {id: 'ultimate_chicken_grill', combo: true}}),
      // { queries: ['combo 10'], expecteds: [['10_piece_nuggets', combo: true]] },
      ...withAndWithoutDrink({query: 'combo 11', expected: {id: 'premium_cod', combo: true}}),
      { queries: ['two combo twos'], expecteds: [[{id: 'double', combo: true}, {id: 'double', combo: true}]] },
      { queries: ['strawberry smoothie'], expecteds: [[{id: 'strawberry_smoothie'}]] },
      { queries: ['guava smoothie'], expecteds: [[{id: 'guava_smoothie'}]] },
      { queries: ['mango passion smoothie'], expecteds: [[{id: 'mango_passion_smoothie'}]] },
      { queries: ['wild berry smoothie'], expecteds: [[{id: 'wild_berry_smoothie'}]] },
      { queries: ['strawberry banana smoothie'], expecteds: [[{id: 'strawberry_banana_smoothie'}]] },
      { queries: ['french fries'], sizes: ['small', 'medium', 'large'], expecteds: [[{id: 'french_fry'}]] },
      { queries: ['fries'], sizes: ['small', 'medium', 'large'], expecteds: [[{id: 'french_fry'}]] },
      { queries: ['waffle fries'], expecteds: [[{id: 'waffle_fry'}]] },
      { queries: ['medium waffle fries'], expecteds: [[{id: 'waffle_fry', size: 'medium'}]] },
      { queries: ['large waffle fries'], expecteds: [[{id: 'waffle_fry', size: 'large'}]] },
      { queries: ['combo 1 with waffle fries'], expecteds: [[{id: 'single', combo: true, modifications: [{ id: 'waffle_fry' }] }]] },
      ...withAndWithoutDrink({query: 'combo 1 with waffle fries', expected: {id: 'single', combo: true, modifications: [{ id: 'waffle_fry' }]}}),
      { queries: ['coca cola'], sizes: ['small', 'medium', 'large'], expecteds: [[{id: 'coca_cola'}]] },
      { queries: ['coke'], sizes: ['small', 'medium', 'large'], expecteds: [[{id: 'coca_cola'}]] },
      { queries: ['diet coke'], sizes: ['small', 'medium', 'large'], expecteds: [[{id: 'diet_coke'}]] },
      { queries: ['barq'], sizes: ['small', 'medium', 'large'], expecteds: [[{id: 'barq'}]] },
      { queries: ['fanta'], sizes: ['small', 'medium', 'large'], expecteds: [[{id: 'fanta'}]] },
      { queries: ['sprite'], sizes: ['small', 'medium', 'large'], expecteds: [[{id: 'sprite'}]] },
      { queries: ['iced tea'], sizes: ['small', 'medium', 'large'], expecteds: [[{id: 'iced_tea'}]] },
      { queries: ['sweet black coffee'], sizes: ['small', 'medium', 'large'], expecteds: [[{id: 'sweet_black_coffee'}]] },
      { queries: ['french vanilla coffee'], sizes: ['small', 'medium', 'large'], expecteds: [[{id: 'french_vanilla_coffee'}]] },
      { queries: ['cappuccino coffee'], sizes: ['small', 'medium', 'large'], expecteds: [[{id: 'cappuccino_coffee'}]] },
      { queries: ['mocha shake'], sizes: ['small', 'medium', 'large'], expecteds: [[{id: 'mocha_shake'}]] },
      { queries: ['caramel shake'], sizes: ['small', 'medium', 'large'], expecteds: [[{id: 'caramel_shake'}]] },
      { queries: ['lemonade'], sizes: ['small', 'medium', 'large'], expecteds: [[{id: 'lemonade'}]] },
      { queries: ['strawberry lemonade'], sizes: ['small', 'medium', 'large'], expecteds: [[{id: 'strawberry_lemonade'}]] },
      { queries: ['wild berry lemonade'], sizes: ['small', 'medium', 'large'], expecteds: [[{id: 'wild_berry_lemonade'}]] },
      { queries: ['loaded fries'], expecteds: [[{id: 'loaded_fry'}]] },
      { queries: ['chili fries'], expecteds: [[{id: 'chili_fry'}]] },
      { queries: ['garden salad'], expecteds: [[{id: 'garden_salad'}]] },
      { queries: ['caesar salad'], expecteds: [[{id: 'caesar_salad'}]] },
      { queries: ['chili'], sizes: ['small', 'large'], expecteds: [[{id: 'chili'}]] },
      { queries: ['vanilla shake'], expecteds: [[{id: 'vanilla_shake'}]] },
      { queries: ['mango passion shake'], expecteds: [[{id: 'mango_passion_shake'}]] },
      { queries: ['strawberry shake'], expecteds: [[{id: 'strawberry_shake'}]] },
      { queries: ['guava shake'], expecteds: [[{id: 'guava_shake'}]] },
      { queries: ['chocolate shake'], expecteds: [[{id: 'chocolate_shake'}]] },
      { queries: ['banana shake'], expecteds: [[{id: 'banana_shake'}]] },
      { queries: ['wild berry shake'], expecteds: [[{id: 'wild_berry_shake'}]] },
      { queries: ['vanilla frosty'], expecteds: [[{id: 'vanilla_frosty'}]] },
      { queries: ['chocolate frosty'], expecteds: [[{id: 'chocolate_frosty'}]] },
      { queries: ['apple pie'], expecteds: [[{id: 'apple_pie'}]] },
      { queries: ['apple pecan salad'], expecteds: [[{id: 'apple_pecan_salad'}]] },
      { queries: ['spicy caesar salad'], expecteds: [[{id: 'spicy_caesar_salad'}]] },
      { queries: ['taco salad'], expecteds: [[{id: 'taco_salad'}]] },
      { queries: ['southwest avacado salad'], expecteds: [[{id: 'southwest_avacado_salad'}]] },
      { queries: ['breakfast baconator'], expecteds: [[{id: 'breakfast_baconator'}]] },
      { queries: ['french toast sandwich'], expecteds: [[{id: 'french_toast_sandwich'}]] },
      { queries: ['egg muffin'], expecteds: [[{id: 'egg_muffin'}]] },
      { queries: ['chicken on french toast'], expecteds: [[{id: 'chicken_on_french_toast'}]] },
      { queries: ['pancake platter'], expecteds: [[{id: 'pancake_platter'}]] },
      { queries: ['double sausage muffin'], expecteds: [[{id: 'double_sausage_muffin'}]] },
      { queries: ['pancakes'], expecteds: [[{id: 'pancake'}]] },
      { queries: ['french toast'], expecteds: [[{id: 'french_toast'}]] },
      { queries: ['oatmeal'], expecteds: [[{id: 'oatmeal'}]] },
      ...withAndWithoutDrink({query: 'junior bacon cheeseburger', expected: {id: 'junior_bacon_cheeseburger', combo: true}}),
      ...withAndWithoutDrink({query: 'junior crispy chicken club', expected: {id: 'junior_crispy_chicken_club', combo: true}}),
      ...withAndWithoutDrink({query: 'chicken go wrap', expected: {id: 'chicken_go_wrap', combo: true}}),
      { queries: ['broccoli and cheddar potato'], expecteds: [[{id: 'broccoli_list_cheddar_potato'}]] },
      { queries: ['bacon and cheddar potato'], expecteds: [[{id: 'bacon_list_cheddar_potato'}]] },
      ...withAndWithoutDrink({query: 'hamburger', expected: {id: 'hamburger', combo: true}}),
      ...withAndWithoutDrink({query: 'cheeseburger', expected: {id: 'cheeseburger', combo: true}}),
      { queries: ['10 piece chicken nuggets'], expecteds: [[{id: '10_piece_chicken_nugget'}]] },
      ...withAndWithoutDrink({query: '4 piece chicken nuggets', expected: {id: '4_piece_chicken_nugget', combo: true}}),
      { queries: ['5 piece chicken nuggets'], expecteds: [[{id: '5_piece_chicken_nugget'}]] },
      // { queries: ['6 piece chicken nuggets'], expecteds: [[{id: '6_piece_chicken_nugget', combo: true}]] },
      ...withAndWithoutDrink({query: '6 piece chicken nuggets', expected: {id: '6_piece_chicken_nugget', combo: true}}),
      { queries: ['loaded fries'], expecteds: [[{id: 'loaded_fry'}]] },
      { queries: ['chili fries'], expecteds: [[{id: 'chili_fry'}]] },
      { 
        queries: ['combo 1 with iced tea', 'change the single combo to a baconator combo'], 
        expecteds: [
          [{id: 'single', combo: true, modifications: [{id: 'iced_tea'}] }],
          [{id: 'baconator', combo: true, modifications: [{id: 'iced_tea'}] }],
        ], 
      },
      { 
        queries: ['combo 1 with iced tea', 'reset', 'combo 1 with iced tea', 'change the single combo to a baconator combo'], 
        expecteds: [
          [{id: 'single', combo: true, modifications: [{id: 'iced_tea'}] }],
          [],
          [{id: 'single', combo: true, modifications: [{id: 'iced_tea'}] }],
          [{id: 'baconator', combo: true, modifications: [{id: 'iced_tea'}] }],
        ], 
      },
      { 
        queries: ['combo 1 with iced tea', 'change it to a baconator combo'], 
        expecteds: [
          [{id: 'single', combo: true, modifications: [{id: 'iced_tea'}] }],
          [{id: 'baconator', combo: true, modifications: [{id: 'iced_tea'}] }],
        ], 
      },
      { 
        queries: ['a large sprite', 'change the drink to a coke'], 
        expecteds: [
          [{id: 'sprite', size: 'large'}],
          [{id: 'coca_cola', size: 'large'}],
        ], 
      },
      { 
        queries: ['a large sprite', 'change the pop to a coke'], 
        expecteds: [
          [{id: 'sprite', size: 'large'}],
          [{id: 'coca_cola', size: 'large'}],
        ], 
      },
      { 
        queries: ['a large sprite', 'change the sprite to a coke'], 
        expecteds: [
          [{id: 'sprite', size: 'large'}],
          [{id: 'coca_cola', size: 'large'}],
        ], 
      },
      { 
        queries: ['a large sprite', 'reset'], 
        expecteds: [
          [{id: 'sprite', size: 'large'}],
          [],
        ], 
      },
      { 
        queries: ['combo 1 with iced tea', 'no combo 1'], 
        expecteds: [
          [{id: 'single', combo: true, modifications: [{id: 'iced_tea'}] }],
          [],
        ], 
      },
      { 
        queries: ['combo 1 with iced tea', 'remove the combo'], 
        expecteds: [
          [{id: 'single', combo: true, modifications: [{id: 'iced_tea'}] }],
          [],
        ], 
      },
      { 
        queries: ['a pop', 'fanta'], 
        expecteds: [
          [{ query: 'What kind of pop?' }],
          [{id: 'fanta', combo: false}],
        ], 
      },
      { 
        queries: ['a large pop', 'fanta'], 
        expecteds: [
          [{ query: 'What kind of pop?' }],
          [{id: 'fanta', size: 'large', combo: false}],
        ], 
      },
      { 
        queries: ['2 large pops', 'fanta'], 
        expecteds: [
          [{ query: 'What kind of pops?' }],
          [{id: 'fanta', size: 'large', combo: false}, {id: 'fanta', size: 'large', combo: false}],
        ], 
      },
      { 
        queries: ['a combo with iced tea', 'triple'], 
        expecteds: [
          [{ query: 'What kind of combo?' }],
          [{id: 'triple', combo: true, modifications: [{id: 'iced_tea'}] }],
        ], 
      },
      { 
        queries: ['a combo'], 
        expecteds: [
          [{ query: 'What kind of combo?' }],
        ], 
      },
      { 
        queries: ['a combo', 'a single combo'], 
        expecteds: [
          [{ query: 'What kind of combo?' }],
          [{id: 'single', combo: true }],
        ], 
      },
      { 
        queries: ['a shake', 'vanilla'], 
        expecteds: [
          [{ query: 'What kind of shake?' }],
          [{id: 'vanilla_shake', combo: false}],
        ], 
      },
      { 
        queries: ['a shake', 'a chocolate shake'], 
        expecteds: [
          [{ query: 'What kind of shake?' }],
          [{id: 'chocolate_shake', combo: false}],
        ], 
      },
      { 
        queries: ['a shake', 'nevermind'], 
        expecteds: [
          [{ query: 'What kind of shake?' }],
          [],
        ], 
      },
      { 
        queries: ['a combo', 'nevermind'], 
        expecteds: [
          [{ query: 'What kind of combo?' }],
          [],
        ], 
      },
      { 
        queries: ['combo 1', 'nevermind'], 
        expecteds: [
          [{id: 'single', combo: true }],
          [],
        ], 
      },
      { 
        queries: ['a combo', '3'], 
        expecteds: [
          [{ query: 'What kind of combo?' }],
          [{id: 'triple', combo: true }],
        ], 
      },
  ]
  queries.forEach((query) => {
    let neo = ''
    if (query.neo) {
      neo = 'NEO23'
    }
    const queriesString = query.queries.map((query) => `'${query}'`).join(" ")
    console.log('queriesString', queriesString)
    test(`${neo}FASTFOOD query "${queriesString}"`, async () => {
      await showTest(query)
    }, timeout)
    if (query.sizes) {
      function clone(a) {
        return JSON.parse(JSON.stringify(a));
      }
      for (let size of query.sizes) {
        const squery = clone(query)
        squery.queries[0] = `${size} ${squery.queries[0]}`
        squery.expecteds.forEach( (expected) => {
          expected[0].size = size
        })
        const queriesString = squery.queries.map((query) => `'${query}'`).join(" ")
        test(`${neo}FASTFOOD query "${queriesString}"`, async () => {
          // console.log('squery', JSON.stringify(squery, null, 2))
          await showTest(squery)
        }, timeout)
      }
    }
  })
});
