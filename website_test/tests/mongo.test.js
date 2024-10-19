const { MongoClient } = require('mongodb');
const _ = require('lodash')
const puppeteer = require('puppeteer')
const tests = require('./tests.json')

// MONGO_URL=http://box1:27017;URL=http://thinktelligence.com:81 npm run mongo

const url = process.env.MONGO_URL || 'mongodb://localhost:27017';
// const url = 'mongodb://localhost:27017';
const LIMIT = 10

// const URL = 'http://thinktelligence.com'
// const URL = 'https://thinktelligence.com:81' || process.env.URL || 'http://localhost:10000'
const URL = process.env.URL || 'http://localhost:10000'
const headless = process.env.HEADLESS !== 'false'
const sloMo = 750
const timeout = 60000

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const getData = async (client, dbName, collectionName, { aggregation = [], sort } = {}) => {
  const db = client.db(dbName);
  const collection = db.collection(collectionName)
  let data;
  if (_.isEmpty(aggregation)) {
    data = collection.find()
    if (sort) {
      data = data.sort(sort)
    }
    return await data.toArray();
  } else {
    data = collection.aggregate(aggregation)
    if (sort) {
      data = data.sort(sort)
    }
    return await data.toArray();
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
  const checkTable = async (page, tableNumber, dataDb, propertiesOrTestFn) => {
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
            const table = td.querySelector("table")
            if (table) {
              const values = []
              for (const span of table.querySelectorAll(".fieldValue")) {
                values.push(span.innerText)
              }
              columns.push(values)
            } else {
              columns.push(td.innerText)
            }
          }
        }
        rows.push(columns)
      }
      return rows
    }, tableNumber, selector);

    for (let i = 0; i < LIMIT; ++i) {
      if (typeof propertiesOrTestFn == 'function') {
        const testFn = propertiesOrTestFn
        expect(testFn(data[i], dataDb[i])).toBe(true)
      } else {
        // console.log('data[i]', JSON.stringify(data[i]))
        // console.log('dataDb[i] -------------------', JSON.stringify(dataDb[i], null, 2))
        const properties = propertiesOrTestFn
        const found = dataDb.find((record) => {
          let matches = true
          for (let iProperty = 0; iProperty < properties.length; ++iProperty) {
            const property = properties[iProperty]
            if (property == '_id') {
              continue // generated so different for each db
            }
            const stringish = (value) => {
              if (Array.isArray(value)) {
                return value
              }
              return value.toString()
            }
            // console.log('property', property)
            // console.log('iProperty', iProperty)
            // console.log('properties', properties)
            if (!_.isEqual(stringish(record[property]), stringish(data[i][iProperty]))) {
              // console.log('record[property]', stringish(record[property]))
              // console.log('data[i][iProperty]', data[i][iProperty])
              matches = false
              break
            }
          }
          return matches ? record : null
        })
        console.log('found -------------------', JSON.stringify(found, null, 2))
        expect(!!found).not.toBe(false)
      }
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

    test(`NEO23 MONGO show the users`, async () => {
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

    test(`MONGO show the users + show all the fields`, async () => {
      await query('show the users')
      await query('show all the fields')
      await page.waitForSelector(`#queryCounter2`)
      await checkTable(page, 1, users, ['_id', 'name', 'email', 'password'])
    }, timeout);

    test(`MONGO show the users + show all the fields + sort by name ascending`, async () => {
      await query('show the users')
      await query('show all the fields')
      await query('sort by name ascending')
      await page.waitForSelector(`#queryCounter3`)
      const users = await getData(client, 'sample_mflix', 'users', { sort: { name: 1 } })
      await checkTable(page, 1, users, ['_id', 'name', 'email', 'password'])
    }, timeout);

    test(`MONGO show the users + show all the fields + sort by name descending`, async () => {
      await query('show the users')
      await query('show all the fields')
      await query('sort by email descending')
      await page.waitForSelector(`#queryCounter3`)
      const users = await getData(client, 'sample_mflix', 'users', { sort: { email: -1 } })
      await checkTable(page, 1, users, ['_id', 'name', 'email', 'password'])
    }, timeout);

    test(`MONGO show the movies + group by genres`, async () => {
      await query('show the movies')
      await query('group by genres')
      await page.waitForSelector(`#queryCounter2`)
      const aggregation = [
            // { "$sort": { "_id": 1 } },
            { "$unwind": "$genres" },
            {
              "$group": {
                "_id": "$genres",
                "genres": { "$first": "$genres" },
                "movies": {
                  "$addToSet": { "genres": "$genres", "title": "$title" }
                }
              }
            },
            /*
            {
              "$project": {
                "genres": 1,
                "movies": {
                  "$slice": [ "$movies", 10 ]
                }
              }
            },
            */
            // { "$sort": { "genres": 1 } },
          ]

      const records = await getData(client, 'sample_mflix', 'movies', { aggregation, limit: 100000 })
      // console.log('data', JSON.stringify(movies, null, 2))

      const tableNumber = 1;

          /*
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
              const table = td.querySelector("table")
              if (table) {
                const values = []
                for (const span of table.querySelectorAll(".fieldValue")) {
                  values.push(span.innerText)
                }
                columns.push(values)
              } else {
                columns.push(td.innerText)
              }
            }
            */

      const selector = `.table_${tableNumber} tbody tr`
      await page.waitForSelector(selector)
      // await sleep(10000)
      const data = await page.evaluate((tableNumber, selector) => {
        const trs = Array.from(document.querySelectorAll(selector))
        const rows = []
        let tableCounter = 2
        for (const tr of trs) {
          const genre = tr.querySelector(".table_1_column_0")
          if (!genre) {
            continue
          }
          const movies = []
          for (const movie of tr.querySelectorAll(`.table_${tableCounter}_column_0`)) {
            movies.push(movie.innerText)
          }
          columns = { genre: genre.innerText, movies }
          rows.push(columns)
          tableCounter += 1
          // rows.push(tr.innerHTML)
        }
        return rows
      }, tableNumber, selector);

      // console.log('data', JSON.stringify(data, null, 2))
      for (const { genre, movies } of data) {
        // console.log('genre', genre)
        const record = records.find((record) => record.genres == genre)
        // console.log('record', record)
        expect(record).not.toBe(undefined)
        for (const movie of movies) {
          /*
          console.log('genre', genre)
          console.log('movie', movie)
          console.log('find', record.movies.find((m) => movie == m.title))
          console.log("record.movies[0]", record.movies[0])
          */
          expect(record.movies.find((m) => movie == m.title)).toBeTruthy()
        }
      }
      /*
      await checkTable(page, 1, movies, (data) => {
        if (data[0] == 'the movies') {
          return true // NA
        }
        // console.log('data', data)
        // console.log('dbData', dbData)
        console.log("movies", JSON.stringify(movies.map(movie => movie.genres), null, 2))
        console.log("data[0]", data[0])
        const record = movies.find((movie) => movie.genres == data[0])
        if (!record) {
          console.log("return 1111111111111111111111111111")
          return false
        }
        for (const title of data[1]) {
          if (!record.movies.find((movie) => title == movie.title)) {
            console.log("return 2222222222222222222222222222222")
            return false
          }
        }
        return true
      })
      */
    }, timeout);

  })
});
