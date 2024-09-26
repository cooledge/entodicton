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

// i fuckin' never remember how to sleep and alway have to fuckin' google. maybe make this a fucking built-in
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

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
  const checkTable = async (page, tableNumber, dataDb, properties) => { 
    const selector = `.table_${tableNumber} tbody tr`
    await page.waitForSelector(selector)
    const data = await page.evaluate((tableNumber, selector) => {
      const trs = Array.from(document.querySelectorAll(selector))
      const rows = []
      for (const tr of trs) {
        const columns = []
        for (const td of tr.cells) {
          const ul = td.querySelector("ul")
          if (ul) {
            const values = []
            for (const li of ul.querySelectorAll("li")) {
              values.push(li.innerText)
            }
            columns.push(values)
          } else {
            columns.push(td.innerText)
          }
        }
        rows.push(columns)
      }
      return rows
    }, tableNumber, selector);

    for (let i = 0; i < LIMIT; ++i) {
      const expected = properties.map(property => dataDb[i][property])
      expect(data[i]).toStrictEqual(expected)
    }
  }

  describe("queries", () => {
    let page;
    let counter;
    beforeEach( async () => {
      counter = 0
      page = await browser.newPage();
      await page.goto(`${URL}/mongo/`)
      await page.waitForSelector('#query')
    })

    afterEach( async () => {
      await page.close()
    })

    const query = async (query) => {
      await page.type('#query', query)
      await page.click('#submit')
      await page.waitForSelector(`#queryCounter${counter+1}`)
      counter += 1
    }

    const hasRule = async (rule) => {
      return await page.evaluate((rule) => {
        const sheet = document.styleSheets[0];
        for (const cssRule of sheet.cssRules) {
          const cssText = cssRule.cssText.replace(/(\r\n|\n|\r)/gm, "");
          console.log(`cssRule '${cssText}' '${rule}'`)
          if (cssRule.cssText == rule) {
            console.log('doing the return')
            return true
          }
        }
      }, rule);
    }

    test(`MONGO show the users`, async () => {
      await query('show the users')
      const dataDb = users
      const property = 'name'
      await checkTable(page, 1, users, ['name'])
    }, timeout);

    test(`MONGO show the movies`, async () => {
      await query('show the movies')
      const dataDb = movies
      const property = 'title'
      await checkTable(page, 1, movies, ['title'])
    }, timeout);

    test(`MONGO show the users and movies`, async () => {
      await query('show the users and movies')
      const dataDb = movies
      const property = 'title'
      await checkTable(page, 2, users, ['name'])
      await checkTable(page, 3, movies, ['title'])
    }, timeout);
    
    test(`MONGO show users\nmake the header blue`, async () => {
      await query('show users')
      await query('make the header blue')
      expect(await hasRule(".header { color: blue; }")).toBe(true)
    }, timeout);

    test(`MONGO show users\nmake the header uppercase`, async () => {
      await query('show users')
      await query('make the header uppercase')
      expect(await hasRule(".header { text-transform: uppercase; }")).toBe(true)
    }, timeout);

    test(`MONGO show users\nmake the header background blue`, async () => {
      await query('show users')
      await query('make the header background blue')
      expect(await hasRule(".header { background-color: blue; }")).toBe(true)
    }, timeout);

    test(`MONGO show users collection select name + email and press select`, async () => {
      await query('show the users collection')
      await page.waitForSelector(`.Chooser`)
      await page.click('#ChooserItem_name')
      await page.click('#ChooserItem_email')
      await page.click('.ChooserButtonSelect')
      await checkTable(page, 1, users, ['name', 'email'])
    }, timeout);

    test(`MONGO show users collection select name + email and press select`, async () => {
      await query('show the users')
      await query('call the report banana')
      await query('show the movies')
      await page.waitForSelector(`#Item_banana`)
      await page.click('#Item_banana')
      await page.waitForSelector(`#queryCounter4`)
      await checkTable(page, 1, users, ['name'])
    }, timeout);

    test(`MONGO show users collection select name + email and show the report by name`, async () => {
      await query('show the users')
      await query('call the report banana')
      await query('show the movies')
      await query('show banana')
      await page.waitForSelector(`#queryCounter4`)
      await checkTable(page, 1, users, ['name'])
    }, timeout);

    test(`MONGO show movies + add various fields`, async () => {
      await query('show the movies')
      await query('show more columns')
      await page.waitForSelector(`#ChooserItem_genres`)
      await page.click('#ChooserItem_genres')
      await page.click('.ChooserButtonSelect')
      await page.waitForSelector(`#queryCounter3`)
      await checkTable(page, 1, movies, ['title', 'genres'])
    }, timeout);

    test(`MONGO what is 2 + 2`, async () => {
      await query('what is 2 + 2')
      await page.waitForSelector(`.response`)
      const data = await page.evaluate(() => {
        const response = document.querySelector('.response')
        const field = response.querySelector(".field")
        return field.innerText
      })
      expect(data).toBe('4')
    }, timeout);

    test(`MONGO show the users + show email`, async () => {
      await query('show the users')
      await query('show email')
      await page.waitForSelector(`#queryCounter2`)
      await checkTable(page, 1, users, ['name', 'email'])
    }, timeout);

  })
});
