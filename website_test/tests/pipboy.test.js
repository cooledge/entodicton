const puppeteer = require('puppeteer')
const tests = require('./tests.json')
const character = require('../../pipboy/src/character.json')

// const URL = 'http://thinktelligence.com'
// const URL = 'https://thinktelligence.com:81' || process.env.URL || 'http://localhost:10000'
const URL = process.env.URL || 'http://localhost:10000'
const headless = process.env.HEADLESS !== 'false'
const sloMo = 0
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

    await page.goto(`${URL}/pipboy/`)

    await page.waitForSelector('#query')
    page.close()
  }, timeout);

  async function showTest({query, items, tab}) {
    const page = await browser.newPage();

    await page.goto(`${URL}/pipboy/`)

    await page.waitForSelector('#query')
    await page.type('#query', query)
    await page.click('#submit')

    if (false) {
      await page.waitForSelector(`.${tab}`)
      console.log('query', query)
      await page.$('.ToDo')
      const mainTab = await page.$('#mainNav > ul > li.nav-item.active > a')
      const mainTabText = await (await mainTab.getProperty('textContent')).jsonValue()
      console.log('mainTabText', mainTabText)

      const paraphrase = await page.$(`.paraphrase`)
      const text = await (await paraphrase.getProperty('textContent')).jsonValue()
      console.log('paraphrase----------------------------', paraphrase)
      console.log('text----------------------------', text)
    }

    // const a = await page.$(`#${item.id}`)
    // const text = await (await a.getProperty('textContent')).jsonValue()

    if (items) {
      for (let item of items) {
        await page.waitForSelector(`#${item.id}`)
      }
      await new Promise(resolve => setTimeout(resolve, 10000))
    }
    page.close()
  }

  test(`PIPBOY show the status`, async () => {
    await showTest({ query: 'show the status', items: null, tab: 'STAT' })
  }, timeout);

  test(`PIPBOY show the special`, async () => {
    await showTest({ query: 'show the special', items: character.special })
  }, timeout);

  test(`PIPBOY show the perks`, async () => {
    await showTest({ query: 'show the perks', items: character.perks })
  }, timeout);

  test(`PIPBOY show the weapons`, async () => {
    await showTest({ query: 'show the weapon', items: character.weapons })
  }, timeout);

  test(`PIPBOY show the apparel`, async () => {
    await showTest({ query: 'show the apparel', items: character.apparel })
  }, timeout);

  test(`PIPBOY show the aid`, async () => {
    await showTest({ query: 'show the aid', items: character.aid })
  }, timeout);

  xtest(`PIPBOY show the quests`, async () => {
    await showTest({ query: 'show the quests', items: character.quests, tab: 'DATA' })
  }, timeout);

  test(`PIPBOY show the map`, async () => {
    await showTest({ query: 'show the map', items: null, tab: 'MAP' })
  }, timeout);

  test(`PIPBOY show the radio`, async () => {
    await showTest({ query: 'show the radio', items: null, tab: 'RADIO' })
  }, timeout);

  xtest(`PIPBOY show data`, async () => {
    await showTest({ query: 'show data', items: null, tab: 'data' })
  }, timeout);

  test(`PIPBOY show the quests`, async () => {
    await showTest({ query: 'show the quests', items: null, tab: 'data' })
  }, timeout);

  test(`PIPBOY show the workshops`, async () => {
    await showTest({ query: 'show the workshops', items: null, tab: 'data' })
  }, timeout);

  test(`PIPBOY show the stats`, async () => {
    await showTest({ query: 'show the stats', items: null, tab: 'data' })
  }, timeout);

  test(`PIPBOY go to the apparel`, async () => {
    const page = await browser.newPage();

    await page.goto(`${URL}/pipboy/`)

    await page.waitForSelector('#query')
    await page.type('#query', 'go to the apparel')
    await page.click('#submit')
    for (let item of character.apparel) {
      await page.waitForSelector(`#${item.id}`)
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
    page.close()
  }, timeout);


  const testQueries = async (queries, tests) => {
    const page = await browser.newPage();

    await page.goto(`${URL}/pipboy/`)

    await page.waitForSelector('#query')

    const retries = 3;
    for (let i = 0; i < queries.length; ++i) {
      for (let retry = 0; retry < retries; ++retry) {
        try {
          const query = queries[i]
          const test = tests[i]
          await page.focus('#query');
          await page.keyboard.down('Control');
          await page.keyboard.press('A');
          await page.keyboard.up('Control');
          await page.keyboard.press('Backspace');
          await page.keyboard.type(query);
          await page.click('#submit')
        // await new Promise(resolve => setTimeout(resolve, 500))
          await test(page)
          break
        } catch( e ) {
          await new Promise(resolve => setTimeout(resolve, 500))
          if (retry+1 == retries) {
            throw e
          }
        }
      }
    }

    page.close()
  }

  const testMovements = async (queries, item, selected) => {
    const test = async (page) => {
      // await new Promise(resolve => setTimeout(resolve, 5000))
      await page.waitForSelector('.current')
      if (selected) {
        await page.waitForSelector('.selected')
      }
      // await new Promise(resolve => setTimeout(resolve, 300))
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
    // await new Promise(resolve => setTimeout(resolve, 5000))
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

  test(`PIPBOY disarm`, async () => {
    const queries = ['show the weapons', 'select', 'disarm']
    const item = character.weapons[0]
    const test = (selected) => async (page) => {
      // await new Promise(resolve => setTimeout(resolve, 5000))
      await page.waitForSelector('.current')
      if (selected) {
        await page.waitForSelector('.selected')
      }
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
      if (selected) {
        await page.waitForSelector('.selected')
      }
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
      if (selected) {
        await page.waitForSelector('.selected')
      }
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
      if (selected) {
        await page.waitForSelector('.selected')
      }
      // await new Promise(resolve => setTimeout(resolve, 300))
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
      if (selected) {
        await page.waitForSelector('.selected')
      }
      const a = await page.$(`#${item.id}`)
      if (selected) {
        await page.waitForSelector('.selected')
      }
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

  const testUse = async (query, allItems, type, message, checkList, moreQueries, moreTests) => {
    const queries = [query]
    const items = allItems.filter( (item) => item.categories.includes(type) )
    const test = () => async (page) => {
      if (checkList) {
        await page.waitForSelector('.current')
        let counter = 1
        for (let item of items) {
          const selector = `.item-list > li:nth-child(${counter})`
          const name = await page.evaluate((selector) => { return document.querySelector(selector).textContent; }, selector);
          expect(name).toBe(item.name)
          await page.$(`#${item.id}`)
          counter += 1
        }
      } else {
        await page.waitForSelector('.message')
      }

      const messageText = await page.evaluate((selector) => { return document.querySelector(selector).textContent; }, ".message");
      expect(messageText).toBe(message)
    }
    const tests = [ test() ]
    await testQueries(queries.concat(moreQueries), tests.concat(moreTests))
  }

  const testUseList = async (query, allItems, type, message, checkList, getsUsedUp) => {
    return test(`PIPBOY ${query}`, async () => {
      const moreQueries = ['down', 'select']
      const items = allItems.filter( (item) => item.categories.includes(type) )
      let item = items[1]
      const moreTests = [
        () => {},
        async (page) => {
          const counter = 2;
          const selector = `.item-list > li:nth-child(${counter})`
          if (getsUsedUp) {
            const element = await page.evaluate((selector) => { return document.querySelector(selector) }, selector);
            expect(element).toBe(null)
            item = items[0] // used up so current moves up
          } else {
            const name = await page.evaluate((selector) => { return document.querySelector(selector).textContent; }, selector);
            expect(name).toBe(item.name)
          }

          const a = await page.$(`#${item.id}`)
          await page.waitForSelector('.current')
          if (!getsUsedUp) {
            await page.waitForSelector('.selected')
          }
          const classNames = await (await a.getProperty('className')).jsonValue()
          if (!getsUsedUp) {
            expect(classNames.includes('selected')).toBeTruthy()
          }
          expect(classNames.includes('current')).toBeTruthy()
        }
      ]
      await testUse(query, allItems, type, message, checkList, moreQueries, moreTests)
    }, timeout);
  }

  testUseList('equip a pistol', character.weapons, 'pistol', "Which one?", true)
  testUseList('wear a suit', character.apparel, 'suit', "Which one?", true)
  testUseList('eat a fruit', character.aid, 'fruit', "Which one?", true, true)

  test(`PIPBOY equip a rifle`, async () => {
    await testUse('equip a rifle', character.weapons, 'rifle', "The current weapon is now Assault Rifle.", false, [], [])
  }, timeout);

  test(`PIPBOY equip the highest damage pistol`, async () => {
    await testUse('equip the highest damage pistol', character.weapons, 'pistol', "The current weapon is now 44 Pistol.", false, [], [])
  }, timeout);

  test(`PIPBOY wear a hat`, async () => {
    await testUse('wear a hat', character.weapons, 'hat', "Put on Chef Hat.", false, [], [])
  }, timeout);

  test(`PIPBOY eat meat`, async () => {
    await testUse('eat meat', character.weapons, 'meat', "Eating Bloatfly Meat.", false, [], [], true)
  }, timeout);

  test(`PIPBOY equip a shotgun`, async () => {
    await testUse('equip a shotgun', character.weapons, 'shotgun', "There are none.", false, [], [])
  }, timeout);

  test(`PIPBOY wear a glove`, async () => {
    await testUse('wear a glove', character.apparel, 'glove', "There are none.", false, [], [])
  }, timeout);

  test(`PIPBOY eat fish`, async () => {
    await testUse('eat fish', character.apparel, 'fish', "There are none.", false, [], [])
  }, timeout);

  test(`PIPBOY equip a glop`, async () => {
    await testUse('equip a glop', character.weapons, 'glop', "glop. What's that?!?!", false, [], [])
  }, timeout);

  test(`PIPBOY wear a glop`, async () => {
    await testUse('wear a glop', character.weapons, 'glop', "glop. What's that?!?!", false, [], [])
  }, timeout);

  test(`PIPBOY eat glop`, async () => {
    await testUse('eat glop', character.weapons, 'glop', "glop. What's that?!?!", false, [], [])
  }, timeout);

});
