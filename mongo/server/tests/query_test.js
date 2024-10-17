const query = require('../query')

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
    client = await query.initialize()
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

  it('nested graph table', async () => {
    const imageSpec = {
                type: "bar",
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
      idCounter: 1,
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
    const actual = await query.query(dataSpec, imageSpec)
    console.log(JSON.stringify(actual, null, 2))
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
      query.addColumns(dataSpec, imageSpec, 'sample_mflix', 'movies', ['email', 'age'])
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
          "field": [],
          "rows": [
            [
              {
                "headers": {
                  "columns": [ { "text": "users", "id": "name" } ]
                },
                "colgroups": [ "column_0" ],
                "table": true,
                "field": [ 0 ],
                "rows": [ "$name" ]
              },
              {
                "headers": {
                  "columns": [ { "text": "movies", "id": "title" } ]
                },
                "colgroups": [ "column_0" ],
                "table": true,
                "field": [ 1 ],
                "rows": [ "$title" ]
              }
            ]
          ]
        }
      query.addColumns(dataSpec, imageSpec, 'sample_mflix', 'movies', ['email', 'age'])
      console.log('actual--', JSON.stringify(imageSpec, null, 2))
      const expected = {
        "headers": {
          "columns": []
        },
        "table": true,
        "explicit": true,
        "field": [],
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
              "field": [
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
              "field": [
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

      await query.addGroup(dataSpec, [field])
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

      await query.addSort(dataSpec, [field])
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

      query.addSort(dataSpec, [field])
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

      query.addSort(dataSpec, [field])
      expect(dataSpec.sort).toStrictEqual({ year: 1, email: -1 })
    })
  })
})

