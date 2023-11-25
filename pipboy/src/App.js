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
import character from './character.json'

function App() {
  const [activeTab, setActiveTab] = useState('stat');
  const [activeStatTab, setActiveStatTab] = useState('status')
  const [activeInvTab, setActiveInvTab] = useState('weapons')
  const [weapon, setWeapon] = useState('44_Pistol');
  const [health, setHealth] = useState(character.health)
  const [weapons, setWeapons] = useState(character.weapons)

  const props = {
    activeTab, setActiveTab,
    activeStatTab, setActiveStatTab,
    activeInvTab, setActiveInvTab,
    weapon, setWeapon,
    health, setHealth,
    weapons, setWeapons,
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

  const speech = { activeTab, setActiveTab, weapon, setWeapon, applyStimpack, setActiveStatTab, setActiveInvTab }
  return (
    <div className="App">
      <Speech {...speech} />
      <Header activeTab={activeTab} setActiveTab={setActiveTab}/>
      { activeTab == 'stat' && <Stat {...props }/> }
      { activeTab == 'inv' && <Inv { ...props }/> }
      { activeTab == 'data' && <ToDo /> }
      { activeTab == 'map' && <ToDo /> }
      { activeTab == 'radio' && <ToDo /> }
      <Footer />
    </div>
  );
}

export default App;
