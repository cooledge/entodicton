import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react'
import Query from './Query'
import Image from './Image'
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

function App() {
  // const [selectingState, setSelectingState] = useState(initSelectingState(initData))
  const [query, doQuery] = useState('')
  const [counter, setCounter] = useState(0)
  // const [data, setData] = useState(initData, doQuery)
  const [data, setData] = useState([], doQuery)
  const [rules, setRules] = useState([])  // { rule, index }

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
      setCounter(counter+1)
      if (!result.noChange) {
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

        /*
        result.rules = result.rules || []
        const additions = []
        const removals = []
        const sames = []
        for (const rule of existing) {
          if (result.rules.includes(rule)) {
            sames.push(rule)
          } else {
            removals.push(rule.index)
          }
        }
        for (const rule of result.rules) {
          if (!rules.includes(rule)) {
            additions.push(rule)
          }
        }
        const sheet = window.document.styleSheets[0]

        /* TODO fix this
        removals.reverse()
        removals.forEach( (i) => sheet.deleteRule(i) )
        */
        /*
        additions.forEach((rule) => {
          const index = sheet.insertRule(rule)
          existing.push({ rule, index })
        })
        setRules(existing)
        */
      }
    }

    doIt()
  }, [query, rules])

  return (
    <div className="App">
      <span id={`queryCounter${counter}`} style={{display: 'none'}}>{counter}</span>
      <Query doQuery={doQuery}/>
      <Image data={data} setupHover={setupHover2(doQuery)}/>

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
