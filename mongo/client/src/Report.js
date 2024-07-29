import { useMemo, useEffect, useState } from 'react'
import { table } from 'table'
import Chart from 'react-apexcharts'

const toHTML = (data) => {
  if (data.graph) {
    return fromGraph(data.graph)
  } else if (data.rows) {
    return fromRows(data.rows)
  } else if (data.columns) {
    return fromCols(data.columns)
  } else {
    return data
  }
}

const fromGraph = (graph) => {
  return <Chart options={graph.options} series={graph.series} type={graph.type} width={500} height={320} />
}

const fromRows = (data) => {
  const rows = []
  for (const row of data) {
    const element = <div className='Row'>{ toHTML(row) }</div>
    rows.push(element)
  }
  return rows
}

const fromCols = (data) => {
  const cols = []
  for (const col of data) {
    const element = <div className='Column'>{toHTML(col)}</div>
    cols.push(element)
  }
  return cols
}

function Report(props) {
  const { data } = props

  const tdata = [
      ['0A', '0B', '0C'],
      ['1A', '1B', '1C'],
      ['2A', '2B', '2C']
  ];

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

  const tdata2 = { 
    rows: [
      { columns: ['0A', '0B', { rows: [{ columns: ['0Ca1', '0Ca2'] }, '0Cb', '0Cc'] }] },
      { columns: ['1A', '1B', { graph }] },
      { columns: ['2A', '2B', '2C'] },
    ]
  }

  const tt =  <table>
  <tr>
    <th>Company</th>
    <th>Contact</th>
    <th>Country</th>
  </tr>
  <tr>
    <td>Alfreds Futterkiste</td>
    <td>Maria Andersr</td>
    <td>Germany</td>
  </tr>
  <tr>
    <td>Centro comercial Moctezuma</td>
    <td>Francisco Chang</td>
    <td>Mexico</td>
  </tr>
</table> 

  return (
    <div className="Report">
      { tt }
      <pre>{ table(tdata) }</pre>
      <span>{JSON.stringify(data)}</span>
      <div className="Table">
        { toHTML(tdata2) }
      </div>
    </div>
  );
}

export default Report;

