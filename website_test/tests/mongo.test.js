const { MongoClient } = require('mongodb');
const _ = require('lodash')
const puppeteer = require('puppeteer')
const tests = require('./tests.json')
const DemoWriter = require('./demoWriter')

const demoWriter = new DemoWriter('../mongo/client/src/demo.json', true)

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

describe('start puppeteer', () => {
  test(`STARTPUPPETEER`, async () => {
    // for automated tests to get puppeteer going before running the tests for real
    await puppeteer.launch({ headless, sloMo });
  }, timeout * 3);
})

describe('tests for the mongo page', () => {

  let client;
  let browser;
  let users, movies;

  beforeAll( async () => {
    client = new MongoClient(url);
    browser = await puppeteer.launch({ headless, sloMo });
    users = await getData(client, 'sample_mflix', 'users')
    movies = await getData(client, 'sample_mflix', 'movies')
  }, timeout);

  afterAll( async () => {
    await browser.close()
    await client.close()
    if (!process.env.NO_DEMOS) {
      demoWriter.write()
    }
  }, timeout);

  test(`STARTPUPPETEER`, async () => {
    // for automated tests to get puppeteer going before running the tests for real
  }, timeout);

  test(`MONGO test page loads`, async () => {
    const page = await browser.newPage();

    await page.goto(`${URL}/mongo/`)

    await page.waitForSelector('#query')
    await page.close()
  }, timeout);

  // TODO check the header once that is fixed up
  const checkTable = async (page, tableNumber, dataDb, propertiesOrTestFn, { sort={}, title } = {}) => {
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

    console.log('dataDb.length', JSON.stringify(dataDb.length, null, 2))
    const getKeyValue = (data) => {
      const keyValue = []
      for (const key of Object.keys(sort)) {
        keyValue[key] = data[key]
      }
      return keyValue
    }

    const compareOkKey = (key1, key2) => {
      if (!key1 || !key2) {
        return true
      }
      for (const key of Object.keys(sort)) {
        if (sort[key] == 1) {
          console.log(`greg23 > ${key1[key]} ${key2[key]}`)
          if (key1[key] > key2[key]) {
            return false
          }
        } else {
          console.log(`greg23 < ${key1[key]} ${key2[key]}`)
          if (key1[key] < key2[key]) {
            return false
          }
        }
      }
      return true
    }

    if (title) {
      const selector = `.table_${tableNumber} caption`
      await page.waitForSelector(selector)
      const data = await page.evaluate((selector) => {
        const caption = document.querySelector(selector)
        return caption.innerText
      }, selector)
      console.log('------ title found ------------', data)
      expect(data).toBe(title)
    }

    let lastKeyValue = undefined
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
          let debug = false
          if (record.name == 'Alliser Thorne') {
            debug = true
          }
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
            if (debug) {
              console.log('property', property)
              console.log('iProperty', iProperty)
              console.log('properties', properties)
            }
            if (!_.isEqual(stringish(record[property]), stringish(data[i][iProperty]))) {
              if (debug) {
                console.log('record[property]', stringish(record[property]))
                console.log('data[i][iProperty]', data[i][iProperty])
              }
              matches = false
              break
            }
          }
          return matches ? record : null
        })
        console.log('found -------------------', JSON.stringify(found, null, 2))
        expect(!!found).not.toBe(false)
        const newKeyValue = getKeyValue(found)
        console.log(`greg23 newKeyValue: ${JSON.stringify(newKeyValue)} lastKeyValue: ${JSON.stringify(lastKeyValue)}`)
        expect(compareOkKey(lastKeyValue, newKeyValue)).toBe(true)
        lastKeyValue = newKeyValue
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
      await query('clear', false)
      demoWriter.startTest()
    }, timeout)

    afterEach( async () => {
      await page.close()
      demoWriter.endTest()
    }, timeout)

    const checkOrder = async (expectedOrder) => {
      const data = await page.evaluate(() => {
        const tables = Array.from(document.querySelectorAll(".Table, .Graph"))
        return tables.map( (table) => table.className)
      })
      const actualOrder = data.map( (cn) => cn.split(' ')[1]).filter( (cn) => expectedOrder.includes(cn))
      expect(actualOrder).toStrictEqual(expectedOrder)
    }

    const notPresent = async (notPresent) => {
      const data = await page.evaluate(() => {
        const tables = Array.from(document.querySelectorAll(".Table, .Graph"))
        return tables.map( (table) => table.className)
      })
      console.log('data', data)
      for (const d of data) {
        expect(d.includes(notPresent)).toBeFalsy()
      }
    }

    const query = async (query, log = true) => { 
      if (log) {
        demoWriter.add(query)
      }
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
      await checkTable(page, 1, users, ['name'])
      await checkTable(page, 3, movies, ['title'])
    }, timeout);
    
    test(`MONGO show users\nmake the header blue`, async () => {
      await query('show users')
      await query('make the header blue')
      expect(await hasRule(".table_2 .header { color: blue; }")).toBe(true)
    }, timeout);

    test(`MONGO show users\nmake the header uppercase`, async () => {
      await query('show users')
      await query('make the header uppercase')
      expect(await hasRule(".table_2 .header { text-transform: uppercase; }")).toBe(true)
    }, timeout);

    test(`MONGO show users\nmake the header background blue`, async () => {
      await query('show users')
      await query('make the header background blue')
      expect(await hasRule(".table_2 .header { background-color: blue; }")).toBe(true)
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
      await page.waitForSelector(`#queryCounter5`)
      await checkTable(page, 1, users, ['name'])
    }, timeout);

    test(`MONGO show users collection select name + email and show the report by name`, async () => {
      await query('show the users')
      await query('call the report banana')
      await query('clear')
      await query('show the movies')
      await query('show banana')
      await checkTable(page, 1, users, ['name'])
    }, timeout);

    test(`MONGO show movies + add various fields`, async () => {
      await query('show the movies')
      await query('show more columns')
      await page.waitForSelector(`#ChooserItem_genres`)
      await page.click('#ChooserItem_genres')
      await page.click('.ChooserButtonSelect')
      await page.waitForSelector(`#queryCounter4`)
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
      await checkTable(page, 1, users, ['name', 'email'])
    }, timeout);

    test(`MONGO show the users + show all the fields`, async () => {
      await query('show the users')
      await query('show all the fields')
      await checkTable(page, 1, users, ['_id', 'email', 'name', 'password'])
    }, timeout);

    test(`MONGO show the users + show all the fields + sort by name ascending`, async () => {
      await query('show the users')
      await query('show all the fields')
      await query('sort by name ascending')
      const users = await getData(client, 'sample_mflix', 'users', { sort: { name: 1 } })
      await checkTable(page, 1, users, ['_id', 'email', 'name', 'password'], { sort: { name: 1 } })
    }, timeout);

    test(`MONGO show the users + show all the fields + sort by name descending`, async () => {
      await query('show the users')
      await query('show all the fields')
      await query('sort by email descending')
      const users = await getData(client, 'sample_mflix', 'users', { sort: { email: -1 } })
      await checkTable(page, 1, users, ['_id', 'email', 'name', 'password'], { sort: { email: -1 } })
    }, timeout);

    test(`MONGO show the movies + group by genres`, async () => {
      await query('show the movies')
      await query('group by genres')
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
      const selector = `.table_${tableNumber} tbody tr`
      await page.waitForSelector(selector)
      const data = await page.evaluate((tableNumber, selector) => {
        const trs = Array.from(document.querySelectorAll(selector))
        const rows = []
        let tableCounter = 3
        for (const tr of trs) {
          const genre = tr.querySelector(".table_3_column_0")
          if (!genre) {
            continue
          }
          const movies = []
          for (const movie of tr.querySelectorAll(`.table_${tableCounter} .table_1_column_0`)) {
            movies.push(movie.innerText)
          }
          columns = { genre: genre.innerText, movies }
          rows.push(columns)
          tableCounter += 1
          // rows.push(tr.innerHTML)
        }
        return rows
      }, tableNumber, selector);

      console.log('data', JSON.stringify(data, null, 2))
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

    test(`MONGO show the genres`, async () => {
      await query('show the genres')
      const genres = new Set()
      for (const movie of movies) {
        for (const genre of movie.genres || []) {
          genres.add(genre)
        }
      }
      await checkTable(page, 2, Array.from(genres).map( (genre) => { return { genre } } ), ['genre'])
    }, timeout);

    test(`MONGO graph the genre and the number of directors and movies`, async () => {
      await query('graph the genre and number of movies')
      await page.waitForSelector(`#queryCounter2`)
      await page.waitForSelector(`.test_graph_bar`)
      const title = await page.evaluate(() => {
        const title = document.querySelector('.Graph .Title')
        return title.innerText
      })
      expect(title).toBe("the genre and number of movies")
    }, timeout);

    test(`MONGO graph the genre and the number of directors and movies`, async () => {
      await query('graph the genre and the number of directors and movies')
      await page.waitForSelector(`#queryCounter2`)
      await page.waitForSelector(`.test_graph_bar`)
      const title = await page.evaluate(() => {
        const title = document.querySelector('.Graph .Title')
        return title.innerText
      })
      expect(title).toBe("the genre and the number of directors and movies")
    }, timeout);

    test(`MONGO graph the genre and the number of directors + graph the year and number of movies`, async () => {
      await query('graph the genre and the number of directors')
      await page.waitForSelector(`.test_graph_bar`)
      await query('graph the year and the number of movies')
      await page.waitForSelector(`.test_graph_bar`)
      await page.waitForSelector(`#queryCounter3`)
      const titles = await page.evaluate(() => {
        // const title = document.querySelector('.Graph .Title')
        // return title.innerText
        const elements = Array.from(document.querySelectorAll('.Graph .Title'))
        const titles = []
        for (const title of elements) {
          titles.push(title.innerText)
        }
        return titles
      })
      const expected = ["the genre and the number of directors", "the year and the number of movies"]
      expect(titles).toStrictEqual(expected)
    }, timeout);

    test(`MONGO show the movies + show the movies + add genre to the second table + add director to the first table`, async () => {
      await query('show the movies')
      await query('show the movies')
      await query('add genre to the second table')
      await query('add director to the first table')
      await checkTable(page, 1, movies, ['title', 'directors'])
      await checkTable(page, 3, movies, ['title', 'genres'])
      await checkOrder(['table_1', 'table_3'])
    }, timeout);

    test(`MONGO show the users + show the movies + for the second table show the id`, async () => {
      await query('show the movies')
      await query('show the movies')
      await query('for the second table show the genre')
      await checkTable(page, 1, movies, ['title'])
      await checkTable(page, 3, movies, ['title', 'genres'])
      await checkOrder(['table_1', 'table_3'])
    }, timeout);

    test(`MONGO show the users + show the movies + show the users for the first and third table show the email`, async () => {
      await query('show the users')
      await query('show the movies')
      await query('show the users')
      await query('for the first and third table show the email')
      await checkTable(page, 1, users, ['name', 'email'])
      await checkTable(page, 3, movies, ['title'])
      await checkTable(page, 4, users, ['name', 'email'])
      await checkOrder(['table_1', 'table_3', 'table_4'])
    }, timeout);

    test(`MONGO show the users + show the movies + show the users show the email to the first and third table`, async () => {
      await query('show the users')
      await query('show the movies')
      await query('show the users')
      await query('add the email to the first and third table')
      await checkTable(page, 1, users, ['name', 'email'])
      await checkTable(page, 3, movies, ['title'])
      await checkTable(page, 4, users, ['name', 'email'])
      await checkOrder(['table_1', 'table_3', 'table_4'])
    }, timeout);
    
    test(`MONGO show the movies + show the movies + sort the second table by title`, async () => {
      await query('show the movies')
      await query('show the movies')
      await query('sort the second table by title')
      await checkTable(page, 1, movies, ['title'])
      await checkTable(page, 3, movies, ['title'], { sort: { name: 1 } })
      await checkOrder(['table_1', 'table_3'])
    }, timeout);

    test(`NEO23 MONGO show the users + show the movies + make the header of the second table blue`, async () => {
      await query('show the users')
      await query('show the movies')
      await query('make the header of the second table blue')
      await checkTable(page, 1, users, ['name'])
      await checkTable(page, 3, movies, ['title'])
      await checkOrder(['table_1', 'table_3'])
      expect(await hasRule(".header { color: blue; }")).toBeFalsy()
      expect(await hasRule(".table_1 .header { color: blue; }")).toBeFalsy()
      expect(await hasRule(".table_3 .header { color: blue; }")).toBeTruthy()
    }, timeout);

    test(`MONGO show the users + show the movies + move the second table up`, async () => {
      await query('show the users')
      await query('show the movies')
      await query('move the second table up')
      await checkTable(page, 1, users, ['name'])
      await checkTable(page, 3, movies, ['title'])
      await checkOrder(['table_3', 'table_1'])
    }, timeout);

    test(`MONGO show the users + show the movies + move the second table down`, async () => {
      await query('show the users')
      await query('show the movies')
      await query('move the first table down')
      await checkTable(page, 1, users, ['name'])
      await checkTable(page, 3, movies, ['title'])
      await checkOrder(['table_3', 'table_1'])
    }, timeout);

    test(`MONGO show the users + show the movies + make the header blue + <select the movie header>`, async () => {
      await query('show the users')
      await query('show the movies')
      await query('make the header blue')
      await page.click('#button_table_3_header')
      await checkTable(page, 1, users, ['name'])
      await checkTable(page, 3, movies, ['title'])
      await checkOrder(['table_1', 'table_3'])
      await page.waitForSelector(`#queryCounter5`)
      expect(await hasRule(".table_3 .header { color: blue; }")).toBeTruthy()
    }, timeout);

    test(`MONGO show the users + show the movies + call the second table fred the wonder dog`, async () => {
      await query('show the users')
      await query('show the movies')
      await query('call the second table fred the wonder dog')
      await checkTable(page, 1, users, ['name'])
      await checkTable(page, 3, movies, ['title'], { title: 'fred the wonder dog' })
      await checkOrder(['table_1', 'table_3'])
    }, timeout);

    test(`MONGO make a pie chart of the genre and number of movies`, async () => {
      await query('make a pie chart of the genre and number of movies')
      await page.waitForSelector(`#queryCounter2`)
      const title = await page.evaluate(() => {
        const title = document.querySelector('.Graph .Title')
        return title.innerText
      })
      expect(title).toBe("the genre and number of movies")
    }, timeout);

    test(`MONGO show the users + show the movies + move the table up`, async () => {
      await query('show the users')
      await query('show the movies')
      await query('move the table up')
      await checkTable(page, 1, users, ['name'])
      await checkTable(page, 3, movies, ['title'])
      await checkOrder(['table_3', 'table_1'])
    }, timeout);

    test(`MONGO show the users + show the movies + move the table up + move the table down`, async () => {
      await query('show the users')
      await query('show the movies')
      await checkOrder(['table_1', 'table_3'])
      await query('move the table up')
      await checkOrder(['table_3', 'table_1'])
      await query('move the table down')
      await checkOrder(['table_1', 'table_3'])
      await checkTable(page, 1, users, ['name'])
      await checkTable(page, 3, movies, ['title'])
    }, timeout);

    test(`MONGO graph the genre and number of movies + change the graph to a pie chart`, async () => {
      await query('graph the genre and number of movies')
      await page.waitForSelector(`.test_graph_bar`)
      await query('change the graph to a pie chart')
      await page.waitForSelector(`.test_graph_pie`)

      const title = await page.evaluate(() => {
        const title = document.querySelector('.Graph .Title')
        return title.innerText
      })
      expect(title).toBe("the genre and number of movies")
    }, timeout);

    test(`MONGO graph the genre and number of movies + change it to a pie chart`, async () => {
      await query('graph the genre and number of movies')
      await page.waitForSelector(`.test_graph_bar`)
      await query('change it to a pie chart')
      await page.waitForSelector(`.test_graph_pie`)

      const title = await page.evaluate(() => {
        const title = document.querySelector('.Graph .Title')
        return title.innerText
      })
      expect(title).toBe("the genre and number of movies")
    }, timeout);

    test(`MONGO show the users + graph the genre and number of movies + move it up`, async () => {
      await query('show the users')
      await query('graph the genre and number of movies')
      await page.waitForSelector(`.test_graph_bar`)
      await checkOrder(['table_1', 'graph_1'])
      await query('move it up')
      await checkOrder(['graph_1', 'table_1'])
    }, timeout);

    test(`MONGO show the users + show the movies + move it up`, async () => {
      await query('show the users')
      await query('show the movies')
      await checkOrder(['table_1', 'table_3'])
      await query('move it up')
      await checkOrder(['table_3', 'table_1'])
    }, timeout);

    test(`MONGO show the users + graph the genre and number of movies + remove the table`, async () => {
      await query('show the users')
      await query('graph the genre and number of movies')
      await page.waitForSelector(`.test_graph_bar`)
      await checkOrder(['table_1', 'graph_1'])
      await query('remove the table')
      await checkOrder(['graph_1'])
      await notPresent(['table_1'])
    }, timeout);

    test(`MONGO show the users + graph the genre and number of movies + remove it`, async () => {
      await query('show the users')
      await query('graph the genre and number of movies')
      await page.waitForSelector(`.test_graph_bar`)
      await checkOrder(['table_1', 'graph_1'])
      await query('remove it')
      await checkOrder(['table_1'])
      await notPresent(['graph_1'])
    }, timeout);

    test(`MONGO show the users + show all the fields + remove the first and third column`, async () => {
      await query('show the users')
      await checkTable(page, 1, users, ['name'])
      await query('show all the fields')
      await checkTable(page, 1, users, ['_id', 'email', 'name', 'password'])
      await query('remove the first and third column')
      await checkTable(page, 1, users, ['email', 'password'])
    }, timeout);

    test(`MONGO show the users + show all the fields + show the movies + remove the second column of the first table`, async () => {
      await query('show the users')
      await checkTable(page, 1, users, ['name'])
      await query('show all the fields')
      await checkTable(page, 1, users, ['_id', 'email', 'name', 'password'])
      await query('show the movies')
      await query('remove the second column of the first table')
      await checkTable(page, 1, users, ['_id', 'name', 'password'])
    }, timeout);

    test(`MONGO show the users + show all the fields + show the movies + remove the second and third column of the first table`, async () => {
      await query('show the users')
      await checkTable(page, 1, users, ['name'])
      await query('show all the fields')
      await checkTable(page, 1, users, ['_id', 'email', 'name', 'password'])
      await query('show the movies')
      await query('remove the second and third column of the first table')
      await checkTable(page, 1, users, ['_id', 'password'])
    }, timeout);

    test(`MONGO show the users + press reset -> no tables shown`, async () => {
      await query('show the users')
      await page.click('#resetSession')
      await page.waitForSelector(`#queryCounter0`)
      const elements = await page.$$('.table_1');
      console.log(elements)
      for (const element of elements) {
        const html = await page.evaluate(el => el.outerHTML, element);
        console.log(html);
      }
      expect(elements.length).toBe(0)
    }, timeout);
  })
});
