const express = require('express')
const createMongoKM = require('./mongo')
const { MongoClient } = require('mongodb');
const { query, initialize } = require('./query')

const app = express()
app.use(express.json())
const port = 5001

const graph = {
  type: "bar",
  options: {
    chart: {
      id: 'apexchart-example'
    },
    xaxis: {
      categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
    }
  },
  series: [{
    name: 'series-1',
    data: [30, 40, 35, 50, 49, 60, 70, 91, 125]
  }]
}

const data = {
  headers: ['h1', 'h2', 'h2' ],
  table: true,
  rows: [
    { columns: ['0A', '0B', { table: true, headers: [], rows: [{ columns: ['0Ca1', '0Ca2'] }, '0Cb', '0Cc'] }] },
    { columns: ['1A', '1B', { graph }] },
    { columns: ['2A', '2B', '2C'] },
  ]
}

const bson = [
  {
    "id": "123",
    "name": "john",
    "age": 25,
    "fav_colors": [
      "red",
      "black"
    ],
    "marks_in_subjects": [
      {
        "marks": 90,
        "subject_id": "abc"
      },
      {
        "marks": 92,
        "subject_id": "def"
      }
    ]
  }
]

const bdata = {
  headers: ['name', 'age', 'favorite colors' ],
  table: true,
  rows: [
    { columns: ['0A', '0B', { table: true, headers: [], rows: [{ columns: ['0Ca1', '0Ca2'] }, '0Cb', '0Cc'] }] },
    { columns: ['1A', '1B', { graph }] },
    { columns: ['2A', '2B', '2C'] },
  ]
}

const instantiate = (bson, bspec) => {
}

let db;
let collection;
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'sample_supplies';
const collectionName = 'sales';

async function mongoQuery() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  db = client.db(dbName);
  collection = db.collection(collectionName)

  // the following code examples can be pasted here...
  const findResult = await collection.find({}).toArray();
  return findResult
  // return 'done.';
}

app.get('/', async (req, res) => {
  const result = await mongoQuery()
  console.log('Found documents =>', result);
  res.send('Hello World!')
})

// the km will be setup on a per user basis since there is state
let lastResponse;


app.post('/query', async (req, res) => {
  try {
    console.log('in query', JSON.stringify(req.body, null, 2))
    if (req.body.query) {
      if (req.body.query.selected) {
        console.log('selected', req.body.query)
        lastResponse = null
        const context = mongoKM.api.current().select
        context.selected = req.body.query
        console.log('context for selecting', JSON.stringify(context, null, 2))
        await mongoKM.processContext(context)
      } else {
        lastResponse = null
        const qr = await mongoKM.query(req.body.query)
      }
    }
    if (lastResponse) {
      console.log('lastResponse', JSON.stringify(lastResponse, null, 2))
      const report = await query(lastResponse.dataSpec, lastResponse.imageSpec)
      console.log("report sent back", JSON.stringify(report, null, 2))
      res.json(report)
    } else {
      res.json({ noChange: true })
    }
    /*
    console.log("json", req.body)
    if (req.body.dataSpec && req.body.reportSpec) {
      const result = await query(req.body.dataSpec, req.body.reportSpec)
      console.log("result", JSON.stringify(result, null, 2))
      res.json(await query(req.body.dataSpec, req.body.reportSpec))
      return
    }
    const result = await mongoQuery()
    data.rows[0].columns[0] = result.length
    res.json(data)
    */
  } catch( e ) {
    console.log('error', e)
  }
})

let mongoKM;
app.listen(port, async () => {
  await initialize()
  mongoKM = await createMongoKM()
  mongoKM.api.listen( (shown) => { lastResponse = shown } )
  console.log(`Example app listening on port ${port}`)
})
