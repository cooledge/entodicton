import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react'
import Query from './Query'
import Report from './Report'
import $ from 'jquery';
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
    // body: JSON.stringify(testQuery),
    body: JSON.stringify({ query }),
    timeout: 1000 * 60 * 5,
    headers: {
      mode: 'no-cors',
      'Content-Type': 'application/json'
    }
  })
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

const initData = {
  "headers": [
    "users"
  ],
  selecting: {
    headers: {
      each: [ [0, 0] ],
      all: [ [0] ],
    } 
  },
  "table": true,
  "rows": [
    [
      "Robert Baratheon"
    ],
    [
      "Sandor Clegane"
    ],
    [
      "Tyrion Lannister"
    ],
    [
      "Khal Drogo"
    ],
    [
      "Joffrey Baratheon"
    ],
    [
      "Viserys Targaryen"
    ],
    [
      "Cersei Lannister"
    ],
    [
      "Samwell Tarly"
    ],
    [
      "Davos Seaworth"
    ],
    [
      "Ned Stark"
    ]
  ]
}

const setupHover = (label, identifier, doQuery) => {
  const className = identifier.join('_')
  const selector = `.${className}`
  console.log('selector', selector)
  // $(selector).mouseover(function(){ console.log("OVER"); $(selector).addClass('highlight');});
  // $(selector).mouseout(function(){$(selector).removeClass('highlight');});
  return <button onClick={ () => doQuery({ selected: identifier }) } onMouseEnter={ () => $(selector).addClass('highlight') } onMouseLeave={ () => $(selector).removeClass('highlight') }  >
            {label}
         </button>
}

const initButtons = (report, doQuery) => {
  if (!report.selecting) {
    return report
  }
  report = {...report}
  report.state = {}
  const eachWithButtons = []
  for (let i = 0; i < report.selecting.headers.each.length; ++i) {
    eachWithButtons.push({ list: [
        report.headers[i], 
        setupHover('CELL', report.selecting.headers.each[i], doQuery),
        setupHover('HEADER', report.selecting.headers.all, doQuery)
      ] 
    })
  }
  report.headers = eachWithButtons
  return report
}

function App() {
  // const [selectingState, setSelectingState] = useState(initSelectingState(initData))
  const [query, doQuery] = useState('')
  const [data, setData] = useState(initButtons(initData, doQuery))

  /*
  console.log('query', JSON.stringify(query))
  if (data.headers) {
    const s = {
      headers: 
    }
  }
  */

  /*
  const [selecting, setSelecting] = useState(true)
  const [hoverH1C1, setHoverH1C1] = useState(false)
  const [hoverH1C2, setHoverH1C2] = useState(false)
  const [hoverH1C3, setHoverH1C3] = useState(false)
  const [thisRow, setThisRow] = useState(false)
  */

  useEffect( () => {
    if (query === '') {
      return
    }

    const doIt = async () => {
      const result = await callServer(query)
      if (!result.noChange) {
        console.log("inDoquery", result)
        setData(initButtons(result, doQuery))
      }
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

/*
      <table>
        <tr>
          <th className={hoverH1C1 || thisRow ? "highlight":""}>Company { setupHover("THIS", setHoverH1C1) } { setupHover("THIS", setThisRow) }</th>
          <th className={hoverH1C2 || thisRow ? "highlight":""}>Company { setupHover("THIS", setHoverH1C2) } { setupHover("THIS", setThisRow) }</th>
          <th className={hoverH1C3 || thisRow ? "highlight":""}>Company { setupHover("THIS", setHoverH1C3) } { setupHover("THIS", setThisRow) }</th>
        </tr>
        <tr>
          <td>Alfreds Futterkiste</td>
          <td>Maria Anders</td>
          <td>Germany</td>
        </tr>
        <tr>
          <td>Centro comercial Moctezuma</td>
          <td>Francisco Chang</td>
          <td>Mexico</td>
        </tr>
      </table>
*/

export default App;
