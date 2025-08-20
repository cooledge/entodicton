const express = require('express')
const createMongoKM = require('./mongo')
const { MongoClient } = require('mongodb');
const { query, initialize } = require('./report')
const session = require('express-session')
const { v4: uuidv4 } = require('uuid');
const { Sessions } = require('./sessions')

const app = express()
app.use(session({
  genid: function(req) {
    return uuidv4() + 'banana' // use UUIDs for session IDs
  },
  secret: 'anonymous sessions'
}))
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
  // console.log('Connected successfully to server');
  db = client.db(dbName);
  collection = db.collection(collectionName)

  // the following code examples can be pasted here...
  const findResult = await collection.find({}).toArray();
  return findResult
  // return 'done.';
}

app.get('/', async (req, res) => {
  const result = await mongoQuery()
  // console.log('Found documents =>', result);
  res.send('mongoapi server')
})

const sessions = new Sessions(createMongoKM)

app.post('/reset', async (req, res) => {
  await sessions.reset(req.sessionID)
  res.json({})
})

// the km will be setup on a per user basis since there is state
app.post('/query', async (req, res) => {
  try {
    const mongoKM = await sessions.get(req.sessionID)
    if (!mongoKM.sessionID) {
      mongoKM.sessionID = req.sessionID
    }
    // console.log('req.sessionID', req.sessionID)
    // console.log('mongoKM.sessionID', mongoKM.sessionID)
    if (!mongoKM) {
      res.json({ noSessions: true, max: sessions.max(), ttl: sessions.ttl() })
      return
    }
    // console.log('sessionId', req.sessionID)
    // console.log('in query', JSON.stringify(req.body, null, 2))
    const queryResponses = []
    if (req.body.query) {
      mongoKM.api.clearLastResponse()
      const query = req.body.query
      // debugger
      if (query.selectReport) {
        // console.log("in select REPORT")
        // console.log("in select REPORT", query.selectReport)
        mongoKM.api.selectReport(query.selectReport)
      }
      else if (req.body.query.chosen) {
        // console.log('results chosen', JSON.stringify(req.body.query, null, 2))
        const currentReport = mongoKM.api.current()
        // console.log('currentReport', JSON.stringify(currentReport, null, 2))
        currentReport.showCollection.chosens.push(req.body.query)
        await mongoKM.processContext(currentReport.showCollection)
      } else if (req.body.query.selected) {
        // console.log('selected', req.body.query)
        const context = mongoKM.api.current().select
        context.selected = req.body.query
        // console.log('context for selecting', JSON.stringify(context, null, 2))
        await mongoKM.processContext(context)
      } else {
        const response = await mongoKM.query(req.body.query)
        for (let i = 0; i < response.contexts.length; ++i) {
          if (response.contexts[0].isResponse) {
            const r = response.responses[i]
            if (r.length > 0) {
              queryResponses.push(response.responses[i])
            }
          }
        }
        // console.log('queryResponses', JSON.stringify(queryResponses, null, 2))
      }
    }
    const lastResponse = mongoKM.api.lastResponse()
    if (lastResponse) {
      // console.log('lastResponse', JSON.stringify(lastResponse, null, 2))

      const response = { queryResponses }
      /*
      if (lastResponse.reportNames) {
        Object.assign(response, { reportNames: lastResponse.reportNames })
      }
      */
      Object.assign(response, { reportNames: mongoKM.api.getReportNames() })

      if (lastResponse.chooseFields) {
        // Object.assign(response, { chooseFields: lastResponse.chooseFields, context: lastResponse.context })
        Object.assign(response, lastResponse)
      }

      if (lastResponse.report) {
        const report = await query(lastResponse.report.dataSpec, lastResponse.report.imageSpec)
        // console.log('lastResponse.report calling getReportNames') 
        response.reportNames = mongoKM.api.getReportNames() // selected could change
        // console.log('response.reportNames', JSON.stringify(response.reportNames))
        response.report = report
      }

      if (lastResponse.clear) {
        response.clear = true
      }

      response.sessions = sessions.statistics()
      console.log(JSON.stringify(response, null, 2))
      res.json(response)
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

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`)
})
