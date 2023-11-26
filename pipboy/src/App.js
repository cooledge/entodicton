import React, { useState } from 'react';
import Stat from './Stat'
import ToDo from './ToDo'
import Inv from './Inv'
import Footer from './Footer'
import Header from './Header'
import Speech from './Speech'
import Message from './Message'
import character from './character.json'
import WeaponList from './WeaponList'

function App() {
  const [activeTab, setActiveTab] = useState('stat');
  const [activeStatTab, setActiveStatTab] = useState('status')
  const [activeInvTab, setActiveInvTab] = useState('weapons')

  const [apparelId, setApparelId] = useState();
  const [apparel, setApparel] = useState(character.apparel);

  const [aidId, setAidId] = useState();
  const [aid, setAid] = useState(character.aid);

  const [weapon, setWeapon] = useState();
  const [weapons, setWeapons] = useState(character.weapons)

  const [health, setHealth] = useState(character.health)
  const [showMessage, setShowMessage] = useState(false)
  const [messageContent, setMessageContent] = useState()

  const getWeapon = (id) => {
    return weapons.find( (weapon) => weapon.id === id )
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

  const props = {
    activeTab, setActiveTab,
    activeStatTab, setActiveStatTab,
    activeInvTab, setActiveInvTab,
    weapon, setWeapon,
    health, setHealth,
    weapons, setWeapons,
    getWeapon,
    applyStimpack,
    changeWeapon: () => {
      setMessageContent((<WeaponList {...props} />))
      setShowMessage(true)
    },

    apparelId, setApparelId,
    apparel, setApparel,

    aidId, setAidId,
    aid, setAid,
  }


  return (
    <div className="App">
      <Speech {...props} />
      <Header activeTab={activeTab} setActiveTab={setActiveTab}/>
      { showMessage &&
        <Message>
          { messageContent }
        </Message>
      }
      { activeTab === 'stat' && <Stat {...props }/> }
      { activeTab === 'inv' && <Inv { ...props }/> }
      { activeTab === 'data' && <ToDo /> }
      { activeTab === 'map' && <ToDo /> }
      { activeTab === 'radio' && <ToDo /> }
      <Footer />
    </div>
  );
}

export default App;
