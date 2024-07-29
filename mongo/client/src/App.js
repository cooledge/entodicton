import logo from './logo.svg';
import './App.css';
import { useState } from 'react'
import Query from './Query'
import Report from './Report'


function App() {
  const [data, setData] = useState({})

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
