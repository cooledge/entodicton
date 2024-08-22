import { useMemo, useEffect, useState } from 'react'
import { table } from 'table'
import Chart from 'react-apexcharts'

const toHTML = (data, options) => {
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
      return data
    }
  }
}

const fromTable = (table, options) => {
  const header = (headers) => {
    if (headers && headers.length > 0) {
      return <tr className='Header'>{ 
        headers.map((h, i) => {
          let className = ''
          if (table.selecting) {
            className += ' ' + table.selecting.headers.each[i]
            className += ' ' + table.selecting.headers.all
          }
          return <th className={className}>{toHTML(h, options)}</th>
        })
      }</tr>
    }
  }
  return <table className="Table">{header(table.headers)}{fromRows(table.rows, options)}</table>
}

const fromGraph = (graph, options) => {
  return <Chart options={graph.options} series={graph.series} type={graph.type} width={500} height={320} />
}

const fromRows = (data, options) => {
  const rows = []
  for (const row of data) {
    const element = <tr className='Row'>{ toHTML(row, options).map( (e) => { return <td>{e}</td>; } )}</tr>
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

function Report(props) {
  const { data } = props
  const options = {
    // selecting: true
  }
  return (
    <div className="Report">
      { toHTML(data, options) }
    </div>
  );
}

export default Report;

