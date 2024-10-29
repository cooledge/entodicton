import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react'
import Query from './Query'
import Chooser from './Chooser'
import NamedReports from './NamedReports'
import NoSessionError from './NoSessionError'
import Image from './Image'
import $ from 'jquery';
// import demo from './demo.json'
const fetch = require('node-fetch')
const _ = require('lodash')

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

const callResetSession = async () => {
  const url = `${new URL(window.location.href).origin}/mongoapi`
  await fetch(`${url}/reset`, {
    method: 'POST',
    body: '{}',
    timeout: 1000 * 60 * 5,
    headers: {
      mode: 'no-cors',
      'Content-Type': 'application/json'
    }
  })
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
  colgroups: ['column_0'],
  rules: [
    '.column_0 { color: blue }',
  ],
  headers: {
    className: 'header',
    selecting: [
      { 
        id: 'header', 
        name: 'Header', 
        className: 'header' 
      }
    ],
    data: [
      {
        className: 'header_0',
        data: "users",
        selecting: [{ id: 'column_0', name: 'Column', className: 'column_0' }],
     }
    ]
  },
  /*
  selecting: {
    headers: {
      each: [ [0, 0] ],
      all: [ [0] ],
    } 
  },
  */
  "table": true,
  "rows": { 
    className: 'rows23', 
    data: [
      { 
        className: 'row0 col1',
        data: [
          "Robert Baratheon"
        ] 
      },
      {
        className: 'row1 col0',
        data: [
          "Sandor Clegane"
        ]
      },
      {
        className: 'row2 col0',
        data: [
            "Tyrion Lannister"
        ],
      },
    ]
  }
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

const setupHover2 = (doQuery) => (label, identifier, className) => {
  const selector = `.${className}`
  const onClick = () => {
    $('.highlight').removeClass('highlight')
    doQuery({ selected: identifier }) 
  }
  return <button onClick={ onClick } onMouseEnter={ () => $(selector).addClass('highlight') } onMouseLeave={ () => $(selector).removeClass('highlight') }  >
            {label}
         </button>
}

const handleReportResult = (result, rules, setData) => {
  const existing = [...rules]
  // console.log("inDoquery", result)
  setData(result)
  const sheet = window.document.styleSheets[0]
  // console.log('cssRules', sheet.cssRules)

  // add rules
  for (const rule of (result.rules || [])) {
    let found = false
    for (const cssRule of sheet.cssRules) {
      // console.log('cssRule', cssRule)
      if (cssRule.cssText == rule) {
        found = true
        break
      }
    }
    if (!found) {
      console.log('inserting rule', rule)
      sheet.insertRule(rule, sheet.cssRules.length)
    }
  }
  console.log('sheet', sheet)
  // remove rules
  const removals = []
  let index = 0;
  console.log('result.rules', result.rules)
  for (const cssRule of sheet.cssRules) {
    console.log('cssRule', cssRule)
    if (cssRule.cssText.startsWith('body') || cssRule.cssText.startsWith('code')) {
      // default
    } else if (result.rules && cssRule.cssText == result.rules.find( (r) => r == cssRule.cssText )) {
      // okay
    } else {
      removals.push(index)
    }
    index += 1
  }
  removals.reverse()
  removals.forEach( (i) => sheet.deleteRule(i) )
}


function App() {
  // const [selectingState, setSelectingState] = useState(initSelectingState(initData))
  const [query, doQuery] = useState({ text: '', counter: 0 })
  const [counter, setCounter] = useState(0)
  // const [data, setData] = useState(initData, doQuery)
  // const [data, setData] = useState(demo, doQuery)
  const [data, setData] = useState([], doQuery)
  const [rules, setRules] = useState([])  // { rule, index }
  // const [choices, setChoices] = useState([ { text: 'c1', id: '1' }, { text: 'c2', id: '2' } ])
  const [choices, setChoices] = useState([])
  const [chooserTitle, setChooserTitle] = useState('')
  const [chooserOrdered, setChooserOrdered] = useState(false)
  const [chosen, setChosen] = useState()
  // const [noSession, setNoSession] = useState({ noSessions: true, max: 25, ttl: 1000 * 5 * 60 })
  const [noSession, setNoSession] = useState()
  // const [namedReports, setNamedReports] = useState([{ name: 'one', id: '1', selected: false }, { name: 'two', id: '2', selected: true }, { name: 'three', id: '3', selected: false }])
  const [namedReports, setNamedReports] = useState([])
  const [resetSession, setResetSession] = useState(false)
  const [queryResponses, setQueryResponses] = useState([])
  // console.log('data', data)
  useEffect( () => {
    if (!resetSession) {
      return
    }
    (async () => {
      await callResetSession()
      debugger
      setNamedReports([])
      setResetSession(false)
      setData([])
      setRules([])
      setCounter(0)
    })()
  }, [resetSession, setNamedReports, setResetSession, setData, setRules, setCounter])

  const handleResponse = (response) => {
    console.log('response', response)
    setChosen(null)
    setChoices([])
    setCounter(counter+1)
    debugger
    if (response.chooseFields) {
      setChooserTitle(response.chooseFields.title)
      setChoices(response.chooseFields.choices)
      setChooserOrdered(response.chooseFields.ordered)
    }
    if (response.noSessions) {
      setNoSession(response)
    }
    if (response.reportNames) {
      setNamedReports(response.reportNames)
    }
    if (response.clear) {
      setData([])
    }
    if (response.report) {
      handleReportResult(response.report, rules, setData)
    }
    setQueryResponses(response.queryResponses)
  }

  const selectNamedReport = async (id) => {
    // call server and select the named report
    console.log('selectNamedReport', id)
    const result = await callServer({ selectReport: id })
    handleResponse(result)
  }

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
    if (!chosen) {
      return
    }

    const doIt = async () => {
      setNoSession()
      if (choices.length > 0) {
        // setChosen(null)
        // setChoices([])
        console.log('call the server with the results', chosen, choices)
        const result = await callServer({ chosen, choices })
        handleResponse(result)
      }
    }
    doIt()
  }, [chosen, choices, setChosen, setData, rules, setChoices, setNoSession])

  useEffect( () => {
    if (query.text === '') {
      return
    }

    const doIt = async () => {
      setNoSession()
      const result = await callServer(query.text)
      handleResponse(result)
    }

    doIt()
  }, [query, rules, setChoices, setChooserTitle, setNoSession, setNamedReports])

  return (
    <div className="App">
      <span id={`queryCounter${counter}`} style={{display: 'none'}}>{counter}</span>
      { noSession &&
        <NoSessionError max={noSession.max} ttl={noSession.ttl}></NoSessionError>
      }
      { choices.length > 0 &&
        <Chooser title={chooserTitle} ordered={chooserOrdered} choices={choices} setChoices={setChoices} setChosen={setChosen}></Chooser>
      }
      <Query doQuery={doQuery} queryResponses={queryResponses} resetSession={() => setResetSession(true)}/>
      <Image data={data} setupHover={setupHover2(doQuery)}/>
      {
        namedReports.length > 0 &&
        <NamedReports namedReports={namedReports} selectNamedReport={selectNamedReport} />
      }
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
