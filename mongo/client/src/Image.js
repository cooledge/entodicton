import { useMemo, useEffect, useState, createElement } from 'react'
import ReactDOMServer from 'react-dom/server'
import { table } from 'table'
import Chart from 'react-apexcharts'

const toHTML = (data, options) => {
  if (!data) {
    debugger // look for bug
  }
  if (data.type) {
    return fromGraph(data, options)
  } else if (data.table) {
    return fromTable(data, options)
  } else if (data.columns) {
    return fromCols(data.columns, options)
  } else if (Array.isArray(data)) {
    return data.map( (element) => toHTML(element, options) )
  } else if (data.list) {
    return <div>{data.list}</div>
  } else {
    if (options.selecting) {
      return <a>{data}</a>
    } else {
      if (data.data || data.className) {
        if (Array.isArray(data.data)) {
          return <ul className={data.className}>{
            data.data.map( (element) => <li>{toHTML(element, options)}</li> )
          }</ul>
        } else {
          return <span className={data.className}>{toHTML(data.data, options)}</span>
        }
      } else {
        return data
      }
    }
  }
}

const fromTable = (table, options) => {
  const header = ({ className, selecting, data:headers} = {}) => {
    if (headers && headers.length > 0) {
      const buttons = []
      if (selecting) {
        for (const {id, name, className} of selecting) {
          buttons.push(options.setupHover(name, id, className))
        }
      }
      return <tr className={className}>{ 
        headers.map((h, i) => {
          let className = ''
          /*
          if (table.selecting) {
            className += ' ' + table.selecting.headers.each[i]
            className += ' ' + table.selecting.headers.all
          }
          */
          const headerButtons = [...buttons] 
          if (h.selecting) {
            for (const {id, name, className} of h.selecting) {
              headerButtons.push(options.setupHover(name, id, className))
            }
          }
          // debugger
          return <th className={className}>{[toHTML(h, options), ...headerButtons]}</th>
        })
      }</tr>
    }
  }
  let colgroup;
  if (table.colgroups) {
    colgroup = <colgroup>{table.colgroups.map((className) => <col key={className} className={className}></col>)}</colgroup>
  }
  // console.log('headers', ReactDOMServer.renderToString(header(table.headers)))
  // return <table className={`Table table_${options.newTableNumber()}`}>
  return <table className={table.className}>
           { table.title &&
             <caption className={`caption_${table.className}`}>{table.title}</caption>
           }
           {colgroup}
             {header(table.headers)}
           <tbody>
             {fromRows(table.rows, options)}
           </tbody>
         </table>
}

const pdata = {
  options: {
    "names": [
      "Mystery",
      "Comedy",
      "Fantasy",
      "Western",
      "Action",
      "Crime",
      "History",
      "Biography",
      "Family",
      "Documentary"
    ],
    "legend": {
      "show": true,
      "position": "bottom"
    }
  },
}

const fromGraph = (graph, options) => {
  // used for integration testing
  const testingClass = `test_graph_${graph.type}`
  if (graph.type == 'pie') {
    const data = graph.series[0].data
    const total = data.reduce((partialSum, a) => partialSum + a, 0)
    const percentages = data.map((value) => value/total)
    const series = percentages
    const labels = {
      show: false,
      name: {
        show: true
      }
    }
    const options = {
      labels: graph.options.xaxis.categories,
      legend: {
        show: true,
        position: 'bottom'
      }
    }
    return <div className={`${graph.className} ${testingClass}`}>
      { graph.title && 
        <span className="Title">{graph.title}</span>
      }
      <Chart options={options} labels={labels} series={percentages} type={graph.type} width={500} height={320} />
    </div>
  } else {
    return <div className={`${graph.className} ${testingClass}`}>
      { graph.title && 
        <span className="Title">{graph.title}</span>
      }
      <Chart options={graph.options} series={graph.series} type={graph.type} width={500} height={320} />
    </div>
  }
}

const fromRows = ({ className, data }, options) => {
  const rows = []
  for (const row of data) {
    let element
    if (row.className) {
      element = <tr className={`${className} ${row.className}`}>{ toHTML(row.data, options).map( (e, i) => { return <td className={row.className}>{e}</td>; } )}</tr>
    } else {
      element = <tr className={`${className}`}>{ toHTML(row, options).map( (e) => { return <td>{e}</td>; } )}</tr>
    }
    rows.push(element)
  }
  return rows
}

const fromCols = (data, options) => {
  const cols = []
  for (const col of data) {
    const element = <td className='Column'>{toHTML(col, options)}</td>
    cols.push(element)
  }
  return cols
}

function Image(props) {
  const { data, setupHover } = props
  const counters = {
    tableNumber: 0
  }
  const options = {
    // selecting: true
    setupHover,
    newTableNumber: () => {
      counters.tableNumber += 1 
      return counters.tableNumber
    }
  }
  return (
    <div className="Image">
      { toHTML(data, options) }
    </div>
  );
}

export default Image;

