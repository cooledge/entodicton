import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import SRDemo from './srdemo';
import parameters from './parameters'
const { avatar, time, reports, help, Config } = require('ekms')

const setupForDemo = (km) => {
  const config = km;
  config.add(help)

  // chrome does not like me directly calling an http server from a page that loaded https. that is why.
  // If you are using your own copy of entoditon make your own proxy server that will be configured with 
  // your key and do this move.

  // what to really call from the proxy server
  config.config.url = parameters.entodicton.url
  // the proxy server. I am passing the key but you should store the key on your server so 
  // its not visible in the browser. Key argument is optional.
  config.server(parameters.thinktelligence.url, parameters.entodicton.apiKey)
  return config;
}

const configs = [
  setupForDemo(avatar),
  setupForDemo(time),
  setupForDemo(reports),
]

function App() {
  const [current, setCurrent] = useState(0);

  const choose = (i) => {
    setCurrent(i)
  }

  const choices = []
  for (let i = 0; i < configs.length; ++i) {
    choices.push(<button onClick={() => choose(i)}>{configs[i].name}</button>)
    //choices.push(<button onClick={setCurrent(i)}>{configs[i].name}</button>)
  }

  return (
    <div className="App">
      <header className="App-header">
        <h2>
          <list>
            { choices }
          </list>
        </h2>
        <SRDemo km={configs[current]}></SRDemo>
      </header>
    </div>
  );
}

export default App;




