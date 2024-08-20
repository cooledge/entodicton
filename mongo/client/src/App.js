import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react'
import Query from './Query'
import Report from './Report'
const fetch = require('node-fetch')

const testData = () => {
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

  const tdata = {
    headers: ['h1', 'h2', 'h2' ],
    table: true,
    rows: [
      { columns: ['0A', '0B', { table: true, headers: [], rows: [{ columns: ['0Ca1', '0Ca2'] }, '0Cb', '0Cc'] }] },
      { columns: ['1A', '1B', { ...graph }] },
      { columns: ['2A', '2B', '2C'] },
    ]
  }

  return tdata
}

const DB_NAME = 'mongos_test_database'
const COLLECTION_NAME = 'sales'

const testQuery = {
  dataSpec: { dbName: DB_NAME, collectionName: COLLECTION_NAME, aggregation: [] },
  reportSpec: {
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
  },
}

const callServer = async (query) => {
  const url = `${new URL(window.location.href).origin}/mongoapi`
  // TODO some kind of client id for state
  const data = { query }
  const result = await fetch(`${url}/query`, {
    method: 'POST',
    body: JSON.stringify(testQuery),
    timeout: 1000 * 60 * 5,
    headers: {
      mode: 'no-cors',
      'Content-Type': 'application/json'
    }
  })
  debugger
  if (result.ok) {
    return JSON.parse(JSON.stringify(await result.json()))
  }
  if (result.status === 504) {
    throw new Error(`Error ${result.status} - ${result.statusText}`)
  }
  if (result.status >= 500 && result.status < 600) {
    throw new Error(`Error ${result.status} - ${result.statusText}.`)
  } if (result.status >= 404) {
    throw new Error(`Error ${result.status} - ${result.statusText} - Trying it connect to ${url}`)
  } else {
    throw new Error(`Error ${result.status} - ${result.statusText}`)
  }
}

function App() {
  const [data, setData] = useState('')
  const [query, doQuery] = useState('')

  useEffect( () => {
    if (query === '') {
      return
    }

    const doIt = async () => {
      const result = await callServer(query)
      setData(result)
      console.log("inDoquery", result)
    }

    doIt()
  }, [query])

  return (
    <div className="App">
      <Query doQuery={doQuery}/>
      <Report data={data}/>
    </div>
  );
}

export default App;
