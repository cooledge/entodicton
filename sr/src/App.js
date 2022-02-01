import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import SRDemo from './srdemo';
import parameters from './parameters'
const { stgame, animals, kirk, scorekeeper, reports, help, properties, hierarchy, Config } = require('ekms')

const setupForDemo = (km) => {
  const config = km;
  if (km.name !== 'stgame') {
    config.add(help)
  }

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

const stgame_callback = (config, update) => {
  stgame.api.response = ({result, context}) => {
    console.log("response in srdemo")
    update(`${context.value} says '${result.generated}'`)
  }
}

/*
stgame.process('kirk what is your name').then( (result) => {
  console.log('result.paraphrarese', result.paraphrases)
  console.log('result.responses', result.responses)
})
*/

/*
const all = new Config({ name: 'all' })
all.add(avatar)
all.add(time)
all.add(reports)
all.add(scorekeeper)
*/

const configs = [
  setupForDemo(animals),
  setupForDemo(stgame),
  setupForDemo(kirk),
  setupForDemo(scorekeeper),
  setupForDemo(reports),
  setupForDemo(properties),
  setupForDemo(hierarchy),
  //setupForDemo(all),
]

const callbacks = [
  () => {}, 
  stgame_callback,
  () => {}, 
  () => {}, 
  () => {}, 
  () => {}, 
  //setupForDemo(all),
]

function App() {
  const [current, setCurrent] = useState(0);

  const choose = (i) => {
    setCurrent(i)
  }

  const choices = []
  for (let i = 0; i < configs.length; ++i) {
    const className = i == current ? 'selected' : '';
    
    choices.push(<button className={className} onClick={() => choose(i)}>{configs[i].name}</button>)
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
        <SRDemo km={configs[current]} callback={callbacks[current]}></SRDemo>
      </header>
    </div>
  );
}

export default App;




