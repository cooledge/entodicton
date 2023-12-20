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

  test(`PIPBOY test page loads`, async () => {
    const page = await browser.newPage();

    await page.goto(`${URL}/pipboy`)
    await page.waitForSelector('#query')
    page.close()
  }, timeout);

  test(`PIPBOY show the weapons`, async () => {
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

  test(`PIPBOY go to the weapons`, async () => {
    const page = await browser.newPage();

    await page.goto(`${URL}/pipboy`)
    await page.waitForSelector('#query')
    await page.type('#query', 'go to the weapons')
    await page.click('#submit')
    for (let item of character.weapons) {
      await page.waitForSelector(`#${item.id}`)
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
    page.close()
  }, timeout);

  test(`PIPBOY show the apparel`, async () => {
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

  test(`PIPBOY show the aid`, async () => {
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

  const testQueries = async (queries, tests) => {
    const page = await browser.newPage();

    await page.goto(`${URL}/pipboy`)
    await page.waitForSelector('#query')

    for (let i = 0; i < queries.length; ++i) {
      const query = queries[i]
      const test = tests[i]
      await page.focus('#query');
      await page.keyboard.down('Control');
      await page.keyboard.press('A');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');
      await page.keyboard.type(query);
      await page.click('#submit')
      await new Promise(resolve => setTimeout(resolve, 250))

      await test(page)
    }

    page.close()
  }

  const testMovements = async (queries, item, selected) => {
    const test = async (page) => {
      // await new Promise(resolve => setTimeout(resolve, 5000))
      await page.waitForSelector('.current')
      const a = await page.$(`#${item.id}`)
      const classNames = await (await a.getProperty('className')).jsonValue()
      if (selected) {
        expect(classNames.includes('selected')).toBeTruthy()
      }
      expect(classNames.includes('current')).toBeTruthy()
      const text = await (await a.getProperty('textContent')).jsonValue()
      const quantity = item.quantity > 1 ? `(${item.quantity})` : '';
      expect(text).toBe(`${item.name}${quantity}`)
    }

    let tests = []
    for (let i = 0; i < queries.length; ++i) {
      if (i+1 == queries.length) {
        tests.push(test)
      } else {
        tests.push(() => {})
      }
    }
    await testQueries(queries, tests)
  }

  test(`PIPBOY select first`, async () => {
    const queries = ['show the weapons', 'select']
    const item = character.weapons[0]
    await testMovements(queries, item, true)
  }, timeout);

  test(`PIPBOY select second`, async () => {
    const queries = ['show the weapons', 'down', 'select']
    const item = character.weapons[1]
    await testMovements(queries, item, true)
    await new Promise(resolve => setTimeout(resolve, 5000))
  }, timeout);

  test(`PIPBOY move down`, async () => {
    const queries = ['show the weapons', 'move down']
    const item = character.weapons[1]
    await testMovements(queries, item)
  }, timeout);

  test(`PIPBOY down`, async () => {
    const queries = ['show the weapons', 'down']
    const item = character.weapons[1]
    await testMovements(queries, item)
  }, timeout);

  test(`PIPBOY down 2`, async () => {
    const queries = ['show the weapons', 'down 2']
    const item = character.weapons[2]
    await testMovements(queries, item)
  }, timeout);

  test(`PIPBOY move up 2`, async () => {
    const queries = ['show the weapons', 'down 3', 'up 2']
    const item = character.weapons[1]
    await testMovements(queries, item)
  }, timeout);

  test(`PIPBOY strip`, async () => {
    const queries = ['show the apparel', 'select', 'strip']
    const item = character.apparel[0]
    const test = (selected) => async (page) => {
      // await new Promise(resolve => setTimeout(resolve, 5000))
      await page.waitForSelector('.current')
      const a = await page.$(`#${item.id}`)
      const classNames = await (await a.getProperty('className')).jsonValue()
      if (selected) {
        expect(classNames.includes('selected')).toBeTruthy()
      }
      expect(classNames.includes('current')).toBeTruthy()
      const text = await (await a.getProperty('textContent')).jsonValue()
      const quantity = item.quantity > 1 ? `(${item.quantity})` : '';
      expect(text).toBe(`${item.name}${quantity}`)
    }
    const tests = [ () => {}, test(true), test(false) ]
    await testQueries(queries, tests)
  }, timeout);

  test(`PIPBOY select unselect weapons`, async () => {
    const queries = ['show the weapons', 'select', 'unselect', 'select']
    const item = character.weapons[0]
    const test = (selected) => async (page) => {
      // await new Promise(resolve => setTimeout(resolve, 5000))
      await page.waitForSelector('.current')
      const a = await page.$(`#${item.id}`)
      const classNames = await (await a.getProperty('className')).jsonValue()
      if (selected) {
        expect(classNames.includes('selected')).toBeTruthy()
      }
      expect(classNames.includes('current')).toBeTruthy()
      const text = await (await a.getProperty('textContent')).jsonValue()
      const quantity = item.quantity > 1 ? `(${item.quantity})` : '';
      expect(text).toBe(`${item.name}${quantity}`)
    }
    const tests = [ () => {}, test(true), test(false), test(true) ]
    await testQueries(queries, tests)
  }, timeout);

  test(`PIPBOY select unselect apparel`, async () => {
    const queries = ['show the apparel', 'select', 'unselect', 'select']
    const item = character.apparel[0]
    const test = (selected) => async (page) => {
      // await new Promise(resolve => setTimeout(resolve, 5000))
      await page.waitForSelector('.current')
      const a = await page.$(`#${item.id}`)
      const classNames = await (await a.getProperty('className')).jsonValue()
      if (selected) {
        expect(classNames.includes('selected')).toBeTruthy()
      }
      expect(classNames.includes('current')).toBeTruthy()
      const text = await (await a.getProperty('textContent')).jsonValue()
      const quantity = item.quantity > 1 ? `(${item.quantity})` : '';
      expect(text).toBe(`${item.name}${quantity}`)
    }
    const tests = [ () => {}, test(true), test(false), test(true) ]
    await testQueries(queries, tests)
  }, timeout);

  test(`PIPBOY outfits - wear`, async () => {
    const queries = ['show the apparel', 'select', 'call this the city outfit', 'unselect', 'wear the city outfit']
    const item = character.apparel[0]
    const test = (selected) => async (page) => {
      // await new Promise(resolve => setTimeout(resolve, 5000))
      await page.waitForSelector('.current')
      const a = await page.$(`#${item.id}`)
      const classNames = await (await a.getProperty('className')).jsonValue()
      if (selected) {
        expect(classNames.includes('selected')).toBeTruthy()
      }
      expect(classNames.includes('current')).toBeTruthy()
      const text = await (await a.getProperty('textContent')).jsonValue()
      const quantity = item.quantity > 1 ? `(${item.quantity})` : '';
      expect(text).toBe(`${item.name}${quantity}`)
    }
    const tests = [ 
      () => {}, 
      test(true), 
      () => {}, 
      test(false),
      test(true) 
    ]
    await testQueries(queries, tests)
  }, timeout);

  test(`PIPBOY outfits - put on`, async () => {
    const queries = ['show the apparel', 'select', 'call this the city outfit', 'unselect', 'put on the city outfit']
    const item = character.apparel[0]
    const test = (selected) => async (page) => {
      // await new Promise(resolve => setTimeout(resolve, 5000))
      await page.waitForSelector('.current')
      const a = await page.$(`#${item.id}`)
      const classNames = await (await a.getProperty('className')).jsonValue()
      if (selected) {
        expect(classNames.includes('selected')).toBeTruthy()
      }
      expect(classNames.includes('current')).toBeTruthy()
      const text = await (await a.getProperty('textContent')).jsonValue()
      const quantity = item.quantity > 1 ? `(${item.quantity})` : '';
      expect(text).toBe(`${item.name}${quantity}`)
    }
    const tests = [ 
      () => {}, 
      test(true), 
      () => {}, 
      test(false),
      test(true) 
    ]
    await testQueries(queries, tests)
  }, timeout);
});
