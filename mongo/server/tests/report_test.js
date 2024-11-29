const report = require('../report')
const { getAPI } = require('./test_helpers')

const bsonSales = [
  {
    "id": "123",
    "year": "1990",
    "sales": "100",
  },
  {
    "id": "123",
    "year": "1991",
    "sales": "110",
  },
  {
    "id": "123",
    "year": "1992",
    "sales": "120",
  },
  {
    "id": "123",
    "year": "1993",
    "sales": "130",
  },
]

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const DB_NAME = 'mongo_test_database'
const COLLECTION_NAME = 'sales'

describe('Reports Tests', () => {
  let client

  beforeAll( async () => {
    client = await report.initialize()
    const myDB = await client.db(DB_NAME)
    try {
      await myDB.collection(COLLECTION_NAME).drop()
    } catch( e ) {
      // errors if collection is not there
    }
    const myColl = await myDB.collection(COLLECTION_NAME);
    for (const doc of bsonSales) {
      await myColl.insertOne(doc);
      /*
      const result = await myColl.insertOne(doc);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
      */
    }
    /*
    for await (const doc of myColl.find()) {
      console.log(doc);
    }
    */
  })

  afterAll( async () => {
    await client.close()
  })

  it('graph', async () => {
    const imageSpec = {
                type: "bar",
                id: 'graph1',
                options: {
                  chart: {
                    id: 'apexchart-example'
                  },
                  xaxis: {
                    categories: { "$push": "$year" },
                  }
                },
                series: [{
                  name: 'series-1',
                  data: { "$push": "$sales" },
                }]
              }

    const expected = {
      id: 'graph1',
      "type": "bar",
      "options": {
        "chart": {
          "id": "apexchart-example"
        },
        "xaxis": { "categories": [ "1990", "1991", "1992", "1993" ] }
      },
      "series": [
        {
          "name": "series-1",
          "data": [ "100", "110", "120", "130" ]
        }
      ]
    }

    const dataSpec = { dbName: DB_NAME, collectionName: COLLECTION_NAME, aggregation: [] }
    const actual = await report.query(dataSpec, imageSpec)
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(expected)
  })

  it('first addReport with graph', async () => {
    const testReport = { dataSpec: {}, imageSpec: { id: 'table1' } }

    const gImageSpec = {
                type: "bar",
                id: 'graph1',
                options: {
                  chart: {
                    id: 'apexchart-example'
                  },
                  xaxis: {
                    categories: { "$push": "$year" },
                  }
                },
                series: [{
                  name: 'series-1',
                  data: { "$push": "$sales" },
                }]
              }
    const gDataSpec = { dbName: DB_NAME, collectionName: COLLECTION_NAME, aggregation: [] }
    const gReport = { imageSpec: gImageSpec, dataSpec: gDataSpec }

    const expectedGraph = {
      "className": "column column_0 table_1_column_0",
      data: {
        "type": "bar",
        id: 'graph1',
        dataSpecPath: [0],
        "options": {
          "chart": {
            "id": "apexchart-example"
          },
          "xaxis": { "categories": [ "1990", "1991", "1992", "1993" ] }
        },
        "series": [
          {
            "name": "series-1",
            "data": [ "100", "110", "120", "130" ]
          }
        ]
      }
    }
    const expected = {
      "headers": {
        "className": "header",
        "data": []
      },
      "className": "Table table_1",
      colgroups: undefined,
      "table": true,
      "rows": {
        "className": "rows",
        "data": [ 
          [ 
            expectedGraph
          ]
        ]
      }
    }

    const api = getAPI()
    report.addReport(api, testReport, gReport)
    debugger
    const actual = await report.query(testReport.dataSpec, testReport.imageSpec)
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(expected)
  })

  it('second addReport with graph', async () => {
    const testReport = { dataSpec: {}, imageSpec: {id: 'table_1'} }

    const gImageSpec = (id) => { return {
        type: "bar",
        options: {
          chart: {
            id: 'apexchart-example'
          },
          xaxis: {
            categories: { "$push": "$year" },
          }
        },
        id,
        series: [{
          name: 'series-1',
          data: { "$push": "$sales" },
        }]
      }
    }
    const gDataSpec = { dbName: DB_NAME, collectionName: COLLECTION_NAME, aggregation: [] }
    const gReport = (id) => { return { imageSpec: gImageSpec(id), dataSpec: gDataSpec } }

    const expectedGraph = (fieldId, graph_id) => { return {
        "className": "column column_0 table_1_column_0",
        data: {
          "type": "bar",
          dataSpecPath: [fieldId],
          id: `graph_${graph_id}`,
          "options": {
            "chart": {
              "id": "apexchart-example"
            },
            "xaxis": { "categories": [ "1990", "1991", "1992", "1993" ] }
          },
          "series": [
            {
              "name": "series-1",
              "data": [ "100", "110", "120", "130" ]
            }
          ]
        }
      }
    }

    const expected = {
      "headers": {
        "className": "header",
        "data": []
      },
      "className": "Table table_1",
      colgroups: undefined,
      "table": true,
      "rows": {
        "className": "rows",
        "data": [ 
            [ expectedGraph(0, 1) ],
            [ expectedGraph(1, 2) ],
        ]
      }
    }


    const api = getAPI()
    report.addReport(api, testReport, gReport("graph_1"))
    report.addReport(api, testReport, gReport("graph_2"))
    console.log('testReport', JSON.stringify(testReport, null, 2))
    debugger
    const actual = await report.query(testReport.dataSpec, testReport.imageSpec)
    console.log('expected', JSON.stringify(expected, null, 2))
    console.log('actual', JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(expected)
  })

  describe('addColumn', () => {

    it('add columns to single dataSource ', async () => {
      const dataSpec = {
        "dbName": "sample_mflix",
        "collectionName": "movies",
        "limit": 10,
        "aggregation": []
      }
      const imageSpec = {
        "headers": {
          "columns": [ { "text": "movies", "id": "title" } ]
        },
        "colgroups": [ "column_0" ],
        "table": true,
        "rows": [ "$title" ]
      }
      report.addColumns(dataSpec, imageSpec, 'sample_mflix', 'movies', ['email', 'age'])
      console.log('actual--', JSON.stringify(imageSpec, null, 2))
      const expected = {
              "headers": {
                "columns": [
                  {
                    "text": "movies",
                    "id": "title"
                  },
                  {
                    "text": "email",
                    "id": "email"
                  },
                  {
                    "text": "age",
                    "id": "age"
                  }
                ]
              },
              "colgroups": [
                "column_0",
                "column_1",
                "column_2"
              ],
              "table": true,
              "rows": [
                "$title",
                "$email",
                "$age"
              ]
            }
      expect(imageSpec).toStrictEqual(expected)
    })

    it('add columns to multi reports', async () => {
      const dataSpec = [
          {
            "dbName": "sample_mflix",
            "collectionName": "users",
            "limit": 10,
            "aggregation": []
          },
          {
            "dbName": "sample_mflix",
            "collectionName": "movies",
            "limit": 10,
            "aggregation": []
          }
        ]
      const imageSpec = {
          "headers": { "columns": [] },
          "table": true,
          "explicit": true,
          "dataSpecPath": [],
          "rows": [
            [
              {
                "headers": {
                  "columns": [ { "text": "users", "id": "name" } ]
                },
                "colgroups": [ "column_0" ],
                "table": true,
                "dataSpecPath": [ 0 ],
                "rows": [ "$name" ]
              },
              {
                "headers": {
                  "columns": [ { "text": "movies", "id": "title" } ]
                },
                "colgroups": [ "column_0" ],
                "table": true,
                "dataSpecPath": [ 1 ],
                "rows": [ "$title" ]
              }
            ]
          ]
        }
      report.addColumns(dataSpec, imageSpec, 'sample_mflix', 'movies', ['email', 'age'])
      console.log('actual--', JSON.stringify(imageSpec, null, 2))
      const expected = {
        "headers": {
          "columns": []
        },
        "table": true,
        "explicit": true,
        "dataSpecPath": [],
        "rows": [
          [
            {
              "headers": {
                "columns": [
                  {
                    "text": "users",
                    "id": "name"
                  }
                ]
              },
              "colgroups": [
                "column_0"
              ],
              "table": true,
              "dataSpecPath": [
                0
              ],
              "rows": [
                "$name"
              ]
            },
            {
              "headers": {
                "columns": [
                  {
                    "text": "movies",
                    "id": "title"
                  },
                  {
                    "text": "email",
                    "id": "email"
                  },
                  {
                    "text": "age",
                    "id": "age"
                  }
                ]
              },
              "colgroups": [
                "column_0",
                "column_1",
                "column_2"
              ],
              "table": true,
              "dataSpecPath": [
                1
              ],
              "rows": [
                "$title",
                "$email",
                "$age"
              ]
            }
          ]
        ]
      }
      expect(imageSpec).toStrictEqual(expected)
    })

  })

  describe('add group fields', () => {
    it('group', async () => {
      const dataSpec = {
        dbName: "sample_mflix",
        collectionName: "movies",
        fields: ['title', 'director', 'genre'],
        usedFields: ['title', 'director'],
        limit: 10,
        aggregation: [],
      }

      const field = {
        database: "sample_mflix",
        collection: "movies",
        word: "genre",
        ordering: "ascending",
      }

      await report.addGroup(dataSpec, [field.word])
      const expected = [
        { '$unwind': '$genre' },
        { '$group': { _id: '$genre', genre: { $first: '$genre' }, movies: { $addToSet: { title: '$title', director: '$director', genre: '$genre' } } } },
        {
          "$project": {
            "genre": 1,
            "movies": { "$slice": [ "$movies", 10, ], },
          },
        },

      ]
      expect(dataSpec.aggregation).toStrictEqual(expected)
    })
  })

  describe('add sort fields', () => {

    it('add sf ascending', async () => {
      const dataSpec = {
        dbName: "sample_mflix",
        collectionName: "users",
        limit: 10,
        aggregation: [],
      }

      const field = {
        database: "sample_mflix",
        collection: "users",
        word: "email",
        ordering: "ascending",
      }

      await report.addSort(dataSpec, [field])
      expect(dataSpec.sort).toStrictEqual({ email: 1 })
    })

    it('add sf descending', async () => {
      const dataSpec = {
        dbName: "sample_mflix",
        collectionName: "users",
        limit: 10,
        aggregation: [],
      }

      const field = {
        database: "sample_mflix",
        collection: "users",
        word: "email",
        ordering: "descending",
      }

      report.addSort(dataSpec, [field])
      expect(dataSpec.sort).toStrictEqual({ email: -1 })
    })

    it('overright', async () => {
      const dataSpec = {
        dbName: "sample_mflix",
        collectionName: "users",
        sort: { 'email': 1, 'year': 1 },
        limit: 10,
        aggregation: [],
      }

      const field = {
        database: "sample_mflix",
        collection: "users",
        word: "email",
        ordering: "descending",
      }

      report.addSort(dataSpec, [field])
      expect(dataSpec.sort).toStrictEqual({ year: 1, email: -1 })
    })
  })

  describe('addReport', () => {
    it('add graph to a report that is just a graph', async () => {
      const targetReport = {
        "marker": "report",
        "dataSpec": {
          "dbName": "sample_mflix",
          "collectionName": "movies",
          "fields": [
            { "name": "_id", "isArray": false }, { "name": "awards", "isArray": false }, { "name": "cast", "isArray": true },
            { "name": "countries", "isArray": true }, { "name": "directors", "isArray": true }, { "name": "fullplot", "isArray": false },
            { "name": "genres", "isArray": true }, { "name": "imdb", "isArray": false }, { "name": "languages", "isArray": true },
            { "name": "lastupdated", "isArray": false }, { "name": "num_mflix_comments", "isArray": false }, { "name": "plot", "isArray": false },
            { "name": "rated", "isArray": false }, { "name": "released", "isArray": false }, { "name": "runtime", "isArray": false },
            { "name": "title", "isArray": false }, { "name": "tomatoes", "isArray": false }, { "name": "type", "isArray": false },
            { "name": "year", "isArray": false }
          ],
          "usedFields": [ "genres" ],
          "limit": 10,
          "aggregation": [ 
            { "$unwind": "$genres" },
            {
              "$group": {
                "_id": "$genres",
                "genres": { "$first": "$genres" },
                "movies": { "$addToSet": { "genres": "$genres" } },
                "titleSet": { "$addToSet": { "titleSet": "$title" } }
              }
            },
            {
              "$addFields": { "the size of titleSet": { "$size": "$titleSet" } }
            },
            {
              "$project": {
                "genres": 1,
                "movies": { "$slice": [ "$movies", 10 ] },
                "the size of titleSet": 1
              }
            },
            { "$limit": 10 },
            { "$limit": 10 }
          ],
          "groupFields": [ "genres" ],
          "countFields": [ "title" ]
        },
        "imageSpec": {
          "type": "bar",
          "title": "genre and number of movies",
          "options": {
            "chart": { "id": "apexchart-example" },
            "xaxis": {
              "categories": { "$push": "$genres" }
            }
          },
          "series": [ { "name": "movies", "data": { "$push": "$the size of titleSet" } } ]
        }
      }

      const addedReport = {
        "marker": "report",
        "dataSpec": {
          "dbName": "sample_mflix",
          "collectionName": "movies",
          "fields": [
            { "name": "_id", "isArray": false }, { "name": "awards", "isArray": false }, { "name": "cast", "isArray": true },
            { "name": "countries", "isArray": true }, { "name": "directors", "isArray": true }, { "name": "fullplot", "isArray": false },
            { "name": "genres", "isArray": true }, { "name": "imdb", "isArray": false }, { "name": "languages", "isArray": true },
            { "name": "lastupdated", "isArray": false }, { "name": "num_mflix_comments", "isArray": false }, { "name": "plot", "isArray": false },
            { "name": "rated", "isArray": false }, { "name": "released", "isArray": false }, { "name": "runtime", "isArray": false },
            { "name": "title", "isArray": false }, { "name": "tomatoes", "isArray": false }, { "name": "type", "isArray": false },
            { "name": "year", "isArray": false }
          ],
          "usedFields": [ "year" ],
          "limit": 10,
          "aggregation": [
            { "$unwind": "$year" },
            {
              "$group": {
                "_id": "$year",
                "year": { "$first": "$year" },
                "movies": { "$addToSet": { "year": "$year" } },
                "titleSet": { "$addToSet": { "titleSet": "$title" } }
              }
            },
            {
              "$addFields": { "the size of titleSet": { "$size": "$titleSet" } }
            },
            {
              "$project": {
                "year": 1,
                "movies": { "$slice": [ "$movies", 10 ] },
                "the size of titleSet": 1
              }
            },
            { "$limit": 10 },
            { "$limit": 10 }
          ],
          "groupFields": [ "year" ],
          "countFields": [ "title" ]
        },
        "imageSpec": {
          "type": "bar",
          "title": "the year and number of movies",
          "options": {
            "chart": { "id": "apexchart-example" },
            "xaxis": {
              "categories": { "$push": "$year" }
            }
          },
          "series": [
            {
              "name": "movies",
              "data": { "$push": "$the size of titleSet" }
            }
          ]
        }
      }

      const originalTargetReport = {...targetReport}
      const api = getAPI()
      report.addReport(api, targetReport, addedReport)

      console.log("targetReport.dataSpec", JSON.stringify(targetReport.dataSpec, null, 2))
      expect(targetReport.dataSpec[0]).toStrictEqual(originalTargetReport.dataSpec)
      expect(targetReport.dataSpec[1]).toStrictEqual(addedReport.dataSpec)
    })
  })
})

