const express = require('express')
const tpmkms = require('tpmkms')
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

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/query', (req, res) => {
  res.json(data)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
