const express = require('express')
const tpmkms = require('tpmkms')
const { MongoClient } = require('mongodb');

const app = express()
const port = 5001

const fastfood = tpmkms.fastfood()

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

/*
main()
  .then(() => {
  })
  .catch(console.error)
  .finally(() => client.close());
*/

app.get('/', async (req, res) => {
  const result = await mongoQuery()
  console.log('Found documents =>', result);
  res.send('Hello World!')
})

app.post('/query', async (req, res) => {
  const result = await mongoQuery()
  data.rows[0].columns[0] = result.length
  res.json(data)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})