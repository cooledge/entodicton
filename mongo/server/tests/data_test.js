const data = require('../data')

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
    client = await data.initialize()
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

  it('non-nested db query', async () => {
    const expected = [
        {
          // "_id": "66c634b98806b1910b62923a",
          "id": "123",
          "year": "1990",
          "sales": "100"
        },
        {
          // "_id": "66c634b98806b1910b62923b",
          "id": "123",
          "year": "1991",
          "sales": "110"
        },
        {
          // "_id": "66c634b98806b1910b62923c",
          "id": "123",
          "year": "1992",
          "sales": "120"
        },
        {
          // "_id": "66c634b98806b1910b62923d",
          "id": "123",
          "year": "1993",
          "sales": "130"
        }
      ]

    const dataSpec = { dbName: DB_NAME, collectionName: COLLECTION_NAME, aggregation: [] }
    const actual = await data.instantiate(dataSpec)
    actual.forEach( (doc) => {
      delete doc._id
    })
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(expected)
  })

  it('nested in array once', async () => {
    const expected = [
      [
        {
          // "_id": "66c634b98806b1910b62923a",
          "id": "123",
          "year": "1990",
          "sales": "100"
        },
        {
          // "_id": "66c634b98806b1910b62923b",
          "id": "123",
          "year": "1991",
          "sales": "110"
        },
        {
          // "_id": "66c634b98806b1910b62923c",
          "id": "123",
          "year": "1992",
          "sales": "120"
        },
        {
          // "_id": "66c634b98806b1910b62923d",
          "id": "123",
          "year": "1993",
          "sales": "130"
        }
      ]
    ]

    const dataSpec = [{ dbName: DB_NAME, collectionName: COLLECTION_NAME, aggregation: [] }]
    const actual = await data.instantiate(dataSpec)
    actual[0].forEach( (doc) => {
      delete doc._id
    })
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(expected)
  })

  it('nested in array twice', async () => {
    const element = [
        {
          // "_id": "66c634b98806b1910b62923a",
          "id": "123",
          "year": "1990",
          "sales": "100"
        },
        {
          // "_id": "66c634b98806b1910b62923b",
          "id": "123",
          "year": "1991",
          "sales": "110"
        },
        {
          // "_id": "66c634b98806b1910b62923c",
          "id": "123",
          "year": "1992",
          "sales": "120"
        },
        {
          // "_id": "66c634b98806b1910b62923d",
          "id": "123",
          "year": "1993",
          "sales": "130"
        }
      ]
    const expected = [ element, element ]

    const ds = { dbName: DB_NAME, collectionName: COLLECTION_NAME, aggregation: [] }
    const dataSpec = [ds, ds]
    const actual = await data.instantiate(dataSpec)
    actual[0].forEach( (doc) => { delete doc._id })
    actual[1].forEach( (doc) => { delete doc._id })
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(expected)
  })

  it('nested in hash', async () => {
    const expected = {
      property: [
        {
          // "_id": "66c634b98806b1910b62923a",
          "id": "123",
          "year": "1990",
          "sales": "100"
        },
        {
          // "_id": "66c634b98806b1910b62923b",
          "id": "123",
          "year": "1991",
          "sales": "110"
        },
        {
          // "_id": "66c634b98806b1910b62923c",
          "id": "123",
          "year": "1992",
          "sales": "120"
        },
        {
          // "_id": "66c634b98806b1910b62923d",
          "id": "123",
          "year": "1993",
          "sales": "130"
        }
      ]
    }

    const dataSpec = { property: { dbName: DB_NAME, collectionName: COLLECTION_NAME, aggregation: [] } }
    const actual = await data.instantiate(dataSpec)
    actual.property.forEach( (doc) => {
      delete doc._id
    })
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(expected)
  })

  it('hash nested in array', async () => {
    const expected = [{
      property: [
        {
          // "_id": "66c634b98806b1910b62923a",
          "id": "123",
          "year": "1990",
          "sales": "100"
        },
        {
          // "_id": "66c634b98806b1910b62923b",
          "id": "123",
          "year": "1991",
          "sales": "110"
        },
        {
          // "_id": "66c634b98806b1910b62923c",
          "id": "123",
          "year": "1992",
          "sales": "120"
        },
        {
          // "_id": "66c634b98806b1910b62923d",
          "id": "123",
          "year": "1993",
          "sales": "130"
        }
      ]
    }]

    const dataSpec = [{ property: { dbName: DB_NAME, collectionName: COLLECTION_NAME, aggregation: [] } }]
    const actual = await data.instantiate(dataSpec)
    console.log(JSON.stringify(actual, null, 2))
    actual[0].property.forEach( (doc) => {
      delete doc._id
    })
    expect(actual).toStrictEqual(expected)
  })

  it('array nested in object', async () => {
    const expected = { 
      property: [
        [
          {
            // "_id": "66c634b98806b1910b62923a",
            "id": "123",
            "year": "1990",
            "sales": "100"
          },
          {
            // "_id": "66c634b98806b1910b62923b",
            "id": "123",
            "year": "1991",
            "sales": "110"
          },
          {
            // "_id": "66c634b98806b1910b62923c",
            "id": "123",
            "year": "1992",
            "sales": "120"
          },
          {
            // "_id": "66c634b98806b1910b62923d",
            "id": "123",
            "year": "1993",
            "sales": "130"
          }
        ]
      ]
    }

    const dataSpec = { property: [{ dbName: DB_NAME, collectionName: COLLECTION_NAME, aggregation: [] }] }
    const actual = await data.instantiate(dataSpec)
    actual.property[0].forEach( (doc) => {
      delete doc._id
    })
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(expected)
  })
})

