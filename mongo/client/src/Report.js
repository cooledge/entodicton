import { useMemo, useEffect, useState } from 'react'
import { table } from 'table'
import Chart from 'react-apexcharts'

const toHTML = (data) => {
  if (data.graph) {
    return fromGraph(data.graph)
  } else if (data.table) {
    return fromTable(data)
  } else if (data.columns) {
    return fromCols(data.columns)
  } else {
    return data
  }
}

const fromTable = (table) => {
    /*
      <tr>
        <th>Company</th>
        <th>Contact</th>
        <th>Country</th>
      </tr>
    */
    const header = (headers) => {
      if (headers && headers.length > 0) {
        return <tr className='Header'>{ headers.map((h) => <th>{toHTML(h)}</th>) }</tr>
      }
    }
    return <table className="Table">{header(table.headers)}{fromRows(table.rows)}</table>
}

const fromGraph = (graph) => {
  return <Chart options={graph.options} series={graph.series} type={graph.type} width={500} height={320} />
}

const fromRows = (data) => {
  const rows = []
  for (const row of data) {
    const element = <tr className='Row'>{ toHTML(row) }</tr>
    rows.push(element)
  }
  return rows
}

const fromCols = (data) => {
  const cols = []
  for (const col of data) {
    const element = <td className='Column'>{toHTML(col)}</td>
    cols.push(element)
  }
  return cols
}

function Report(props) {
  const { data } = props

  return (
    <div className="Report">
      { toHTML(data) }
    </div>
  );
}

export default Report;

