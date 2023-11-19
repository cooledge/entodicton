import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import './css/tether.min.css';
import './css/bootstrap.min.css';
import './css/pipboy.css';
import 'bootstrap/dist/css/bootstrap.css'
import Stat from './Stat'
import ToDo from './ToDo'
import Inv from './Inv'
import Footer from './Footer'
import Header from './Header'
import parameters from './parameters'
const { stgame, animals, kirk, scorekeeper, reports, help, properties, hierarchy, Config } = require('tpmkms_4wp')

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
  // setupForDemo(stgame),
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
  const [active, setActive] = useState('stat');
  const [weapon, setWeapon] = useState('44_Pistol');

  const choose = (i) => {
    setActive(i)
  }

  const choices = []
  for (let i = 0; i < configs.length; ++i) {
    const className = i == active ? 'selected' : '';
    
    choices.push(<button className={className} key={configs[i].name} onClick={() => choose(i)}>{configs[i].name}</button>)
    //choices.push(<button onClick={setCurrent(i)}>{configs[i].name}</button>)
  }
  return (
    <div className="App">
      <Header active={active} setActive={setActive}/>
      { active == 'stat' && <Stat /> }
      { active == 'inv' && <Inv weapon={weapon} setWeapon={setWeapon}/> }
      { active == 'data' && <ToDo /> }
      { active == 'map' && <ToDo /> }
      { active == 'radio' && <ToDo /> }
      <Footer />
    </div>
  );
}

export default App;
