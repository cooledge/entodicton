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

const bsonFilms = [
  {
    title: 'Aliens',
    genre: ['horror', 'science fiction'],
  },
  {
    title: "Silence of the Lambs",
    genre: ['horror', 'crime'],
  },
  {
    title: "Star Wars",
    genre: ['science fiction'],
  },
  {
    title: "LA Confidential",
    genre: ['crime'],
  },
]


const DB_NAME = 'mongo_test_database'
const COLLECTION_NAME_SALES = 'sales'
const COLLECTION_NAME_FILMS = 'movies'

describe('Reports Tests', () => {
  let client

  beforeAll( async () => {
    client = await data.initialize()
    const myDB = await client.db(DB_NAME)
    const setup = async (collectionName, bson) => {
      await myDB.collection(collectionName).drop()
      const myColl = await myDB.collection(collectionName);
      for (const doc of bson) {
        await myColl.insertOne(doc);
        /*
        const result = await myColl.insertOne(doc);
        console.log(`A document was inserted with the _id: ${result.insertedId}`);
        */
      }
    }
    await setup(COLLECTION_NAME_SALES, bsonSales)
    await setup(COLLECTION_NAME_FILMS, bsonFilms)
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

    const dataSpec = { dbName: DB_NAME, collectionName: COLLECTION_NAME_SALES, aggregation: [] }
    const actual = await data.instantiate(dataSpec)
    actual.forEach( (doc) => {
      delete doc._id
    })
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(expected)
  })

  it('sort descending', async () => {
    const expected = [
        {
          // "_id": "66c634b98806b1910b62923d",
          "id": "123",
          "year": "1993",
          "sales": "130"
        },
        {
          // "_id": "66c634b98806b1910b62923c",
          "id": "123",
          "year": "1992",
          "sales": "120"
        },
        {
          // "_id": "66c634b98806b1910b62923b",
          "id": "123",
          "year": "1991",
          "sales": "110"
        },
        {
          // "_id": "66c634b98806b1910b62923a",
          "id": "123",
          "year": "1990",
          "sales": "100"
        },
      ]

    const dataSpec = { dbName: DB_NAME, sort: {year: -1}, collectionName: COLLECTION_NAME_SALES, aggregation: [] }
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

    const dataSpec = [{ dbName: DB_NAME, collectionName: COLLECTION_NAME_SALES, aggregation: [] }]
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

    const ds = { dbName: DB_NAME, collectionName: COLLECTION_NAME_SALES, aggregation: [] }
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

    const dataSpec = { property: { dbName: DB_NAME, collectionName: COLLECTION_NAME_SALES, aggregation: [] } }
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

    const dataSpec = [{ property: { dbName: DB_NAME, collectionName: COLLECTION_NAME_SALES, aggregation: [] } }]
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

    const dataSpec = { property: [{ dbName: DB_NAME, collectionName: COLLECTION_NAME_SALES, aggregation: [] }] }
    const actual = await data.instantiate(dataSpec)
    actual.property[0].forEach( (doc) => {
      delete doc._id
    })
    // console.log('actual ------------------', JSON.stringify(actual, null, 2))
    // console.log('expected ------------------', JSON.stringify(expected, null, 2))
    expect(actual).toStrictEqual(expected)
  })

  it('group by aggregation', async () => {
    const expected = {
        "property": [
          [
            {
              "genre": "crime",
              "movies": [
                {
                  "title": "LA Confidential"
                },
                {
                  "title": "Silence of the Lambs"
                },
              ]
            },
            {
              "genre": "horror",
              "movies": [
                {
                  "title": "Aliens"
                },
                {
                  "title": "Silence of the Lambs"
                }
              ]
            },
            {
              "genre": "science fiction",
              "movies": [
                {
                  "title": "Aliens"
                },
                {
                  "title": "Star Wars"
                }
              ]
            }
          ]
        ]
      }


    const dataSpec = { property: [{ 
      dbName: DB_NAME, 
      collectionName: COLLECTION_NAME_FILMS, 
      aggregation: [
        { '$unwind': '$genre' },
        { '$group': { _id: '$genre', genre: { $first: '$genre' }, movies: { $addToSet: { title: '$title' } } } },
        // { $sortArray: { input: 'films', sortBy: { title: 1 } } },
        { $sort: { genre: 1 } },
      ] 
    }] }
    const actual = await data.instantiate(dataSpec)
    actual.property[0].forEach( (doc) => {
      delete doc._id
    })
    for (const genre of actual.property[0]) {
      genre.movies.sort((a,b) => {
        a = a.title
        b = b.title
        if (a == b) {
          return 0
        }
        if (a < b) {
          return -1
        }
        return 1
      }) 
    }
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(expected)
  })

  it('group by aggregation with counts', async () => {
    const expected = {
        "property": [
          [
            {
              "genre": "crime",
              "count": 2,
              "movies": [
                {
                  "title": "LA Confidential"
                },
                {
                  "title": "Silence of the Lambs"
                },
              ]
            },
            {
              "genre": "horror",
              "count": 2,
              "movies": [
                {
                  "title": "Aliens"
                },
                {
                  "title": "Silence of the Lambs"
                }
              ]
            },
            {
              "genre": "science fiction",
              "count": 2,
              "movies": [
                {
                  "title": "Aliens"
                },
                {
                  "title": "Star Wars"
                }
              ]
            }
          ]
        ]
      }


    const dataSpec = { property: [{ 
      dbName: DB_NAME, 
      collectionName: COLLECTION_NAME_FILMS, 
      aggregation: [
        { '$unwind': '$genre' },
        { '$group': { _id: '$genre', genre: { $first: '$genre' }, movies: { $addToSet: { title: '$title' } } } },
        { $addFields: { "count": { '$size': "$movies" }  } },
        { $sort: { genre: 1 } },
      ] 
    }] }
    console.log("dataSpec", JSON.stringify(dataSpec, null, 2))
    const actual = await data.instantiate(dataSpec)
    actual.property[0].forEach( (doc) => {
      delete doc._id
    })
    for (const genre of actual.property[0]) {
      genre.movies.sort((a,b) => {
        a = a.title
        b = b.title
        if (a == b) {
          return 0
        }
        if (a < b) {
          return -1
        }
        return 1
      }) 
    }
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(expected)
  })
})

