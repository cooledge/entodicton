import logo from './logo.svg';
import './App.css';
import { useState } from 'react'
import Query from './Query'
import Report from './Report'

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
      { columns: ['1A', '1B', { graph }] },
      { columns: ['2A', '2B', '2C'] },
    ]
  }

  return tdata
}

function App() {
  const [data, setData] = useState(testData)

  const doQuery = (query) => {
    console.log("inDoquery")
    setData(query)
  }

  return (
    <div className="App">
      <Query doQuery={doQuery}/>
      <Report data={data}/>
    </div>
  );
}

export default App;
