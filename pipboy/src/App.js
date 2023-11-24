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
import Speech from './Speech'
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
  const [activeTab, setActiveTab] = useState('stat');
  const [activeStatTab, setActiveStatTab] = useState('status')
  const [activeInvTab, setActiveInvTab] = useState('weapons')
  const [weapon, setWeapon] = useState('44_Pistol');
  const [health, setHealth] = useState({arm: { left: 80, right: 30 }, leg: { left: 75, right: 60 }, torso: 80, head: 90 });
  const props = {
    activeTab, setActiveTab,
    activeStatTab, setActiveStatTab,
    activeInvTab, setActiveInvTab,
    weapon, setWeapon,
    health, setHealth,
  }

  const applyStimpack = (request) => {
    console.log(`applyStimpack(${JSON.stringify(request)})`)
    const potency = 20;
    const delta = potency / 6;
    setHealth({
      arm: {
        left: Math.min(health.arm.left+delta, 100),
        right: Math.min(health.arm.rigth+delta, 100),
      },
      leg: {
        left: Math.min(health.leg.left+delta, 100),
        right: Math.min(health.leg.rigth+delta, 100),
      },
      torso: Math.min(health.torso+delta, 100),
      head: Math.min(health.head+delta, 100),
    })
  }

  const choose = (i) => {
    setActiveTab(i)
  }

  const choices = []
  for (let i = 0; i < configs.length; ++i) {
    const className = i == activeTab ? 'selected' : '';
    
    choices.push(<button className={className} key={configs[i].name} onClick={() => choose(i)}>{configs[i].name}</button>)
  }
  const speech = { activeTab, setActiveTab, weapon, setWeapon, applyStimpack, setActiveStatTab, setActiveInvTab }
  return (
    <div className="App">
      <Speech {...speech} />
      <Header activeTab={activeTab} setActiveTab={setActiveTab}/>
      { activeTab == 'stat' && <Stat {...props }/> }
      { activeTab == 'inv' && <Inv { ...{ weapon, setWeapon, activeInvTab, setActiveInvTab } }/> }
      { activeTab == 'data' && <ToDo /> }
      { activeTab == 'map' && <ToDo /> }
      { activeTab == 'radio' && <ToDo /> }
      <Footer />
    </div>
  );
}

export default App;
