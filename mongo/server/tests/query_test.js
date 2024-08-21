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

const DB_NAME = 'mongo_test_database'
const COLLECTION_NAME = 'sales'

describe('Reports Tests', () => {
  let client

  beforeAll( async () => {
    client = await query.initialize()
    const myDB = await client.db(DB_NAME)
    await myDB.collection(COLLECTION_NAME).drop()
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
})

