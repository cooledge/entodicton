const { MongoClient } = require('mongodb');
const _ = require('lodash')
const puppeteer = require('puppeteer')
const tests = require('./tests.json')

const url = 'mongodb://localhost:27017';
const LIMIT = 10

// const URL = 'http://thinktelligence.com'
// const URL = 'https://thinktelligence.com:81' || process.env.URL || 'http://localhost:10000'
const URL = process.env.URL || 'http://localhost:10000'
const headless = process.env.HEADLESS !== 'false'
const sloMo = 750
const timeout = 60000

const getData = async (client, dbName, collectionName, aggregation = [], limit=LIMIT) => {
  const db = client.db(dbName);
  const collection = db.collection(collectionName)
  let data;
  if (_.isEmpty()) {
    data = await collection.find().limit(limit).toArray();
  } else {
    data = await collection.aggregate(aggregation).limit(limit).toArray();
  }
  return data
}

describe('tests for the mongo page', () => {

  let client;
  let browser;
  let users, movies;

  beforeAll( async () => {
    client = new MongoClient(url);
    browser = await puppeteer.launch({ headless, sloMo });
    users = await getData(client, 'sample_mflix', 'users')
    movies = await getData(client, 'sample_mflix', 'movies')
  });
  afterAll( async () => {
    await browser.close()
    await client.close()
  });

  test(`MONGO test page loads`, async () => {
    const page = await browser.newPage();

    await page.goto(`${URL}/mongo/`)

    await page.waitForSelector('#query')
    await page.close()
  }, timeout);

  // TODO check the header once that is fixed up
  const checkTable = async (page, tableNumber, dataDb, property) => { 
    const data = await page.evaluate((tableNumber) => {
      const tds = Array.from(document.querySelectorAll(`.table_${tableNumber} tbody tr`))
      return tds.map(td => td.innerText)
    }, tableNumber);

    for (let i = 0; i < LIMIT; ++i) {
      expect(data[i]).toBe(dataDb[i][property])
    }
  }

  test(`MONGO show the users`, async () => {
    const query = 'show the users'
    const dataDb = users
    const property = 'name'

    const page = await browser.newPage();

    await page.goto(`${URL}/mongo/`)

    await page.waitForSelector('#query')
    await page.type('#query', query)
    await page.click('#submit')

    await page.waitForSelector('table')
    
    await checkTable(page, 1, users, 'name')

    await page.close()
  }, timeout);

  test(`MONGO show the movies`, async () => {
    const query = 'show the movies'
    const dataDb = movies
    const property = 'title'

    const page = await browser.newPage();

    await page.goto(`${URL}/mongo/`)

    await page.waitForSelector('#query')
    await page.type('#query', query)
    await page.click('#submit')

    await page.waitForSelector('table')
    
    await checkTable(page, 1, movies, 'title')

    await page.close()
  }, timeout);

  test(`MONGO show the users and movies`, async () => {
    const query = 'show the users and movies'
    const dataDb = movies
    const property = 'title'

    const page = await browser.newPage();

    await page.goto(`${URL}/mongo/`)

    await page.waitForSelector('#query')
    await page.type('#query', query)
    await page.click('#submit')

    await page.waitForSelector('table')
   
    await checkTable(page, 2, users, 'name')
    await checkTable(page, 3, movies, 'title')

    await page.close()
  }, timeout);

  /*
  async function showTest({query, items, tab}) {
    const page = await browser.newPage();

    await page.goto(`${URL}/mongo/`)

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
    await page.close()
  }

  test(`MONGO show the status`, async () => {
    await showTest({ query: 'show the status', items: null, tab: 'STAT' })
  }, timeout);

  */

  /*
  const testQueries = async (queries, tests) => {
    const page = await browser.newPage();

    await page.goto(`${URL}/mongo/`)

    const retries = 3;
    for (let i = 0; i < queries.length; ++i) {
      for (let retry = 0; retry < retries; ++retry) {
        try {
          const query = queries[i]
          const test = tests[i]
          await page.waitForSelector('#query')
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

    await page.close()
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
      await page.waitForSelector('.current')
      try{
        expect(classNames.includes('current')).toBeTruthy()
      } catch(e) {
        console.log('error', classNames)
      }
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

  test(`MONGO select first`, async () => {
    const queries = ['show the weapons', 'select']
    const item = character.weapons[0]
    await testMovements(queries, item, true)
  }, timeout);

  */
});
