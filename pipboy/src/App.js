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

  const [perkId, setPerkId] = useState(character.perks[0].id);
  const [perks, setPerks] = useState(character.perks);

  const [specialId, setSpecialId] = useState(character.special[0].id);
  const [special, setSpecial] = useState(character.special);

  const [apparelId, setApparelId] = useState(character.apparel[0].id);
  const [apparel, setApparel] = useState(character.apparel);

  const [aidId, setAidId] = useState(character.aid[0].id);
  const [aid, setAid] = useState(character.aid);

  const [weaponId, setWeaponId] = useState(character.weapons[0].id);
  const [weapons, setWeapons] = useState(character.weapons)

  const [health, setHealth] = useState(character.health)
  const [showMessage, setShowMessage] = useState(false)
  const [messageContent, setMessageContent] = useState()

  const [lastQuery, setLastQuery] = useState('');

  const getWeapon = (id) => {
    return weapons.find( (weapon) => weapon.id === id )
  }

  // direction: up/down
  const moveTo = (direction, id, setId, items) => {
    const index = items.findIndex((item) => item.id === id)
    let toId;
    if (direction === 'down') {
      if (index+1 < items.length)
        toId = items[index+1].id
    } else {
      if (index-1 >= 0)
        toId = items[index-1].id
    }
    if (toId) {
      console.log("moving to ---------------", toId)
      setId(toId)
    }
  }

  const move = (direction) => {
    if (activeTab === 'stat') {
      if (activeStatTab === 'special') {
        moveTo(direction, specialId, setSpecialId, special)
      } else if (activeStatTab === 'perks') {
        moveTo(direction, perkId, setPerkId, perks)
      }
    } else if (activeTab === 'inv') {
      if (activeInvTab === 'weapons') {
        moveTo(direction, weaponId, setWeaponId, weapons)
      } else if (activeInvTab === 'apparel') {
        moveTo(direction, apparelId, setApparelId, apparel)
      } else if (activeInvTab === 'aid') {
        moveTo(direction, aidId, setAidId, aid)
      }
    }
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
    health, setHealth,

    lastQuery, setLastQuery,
    move,
    getWeapon,
    applyStimpack,
    changeWeapon: () => {
      setMessageContent((<WeaponList {...props} />))
      setShowMessage(true)
    },

    weaponId, setWeaponId,
    weapons, setWeapons,

    apparelId, setApparelId,
    apparel, setApparel,

    aidId, setAidId,
    aid, setAid,

    specialId, setSpecialId,
    special, setSpecial,

    perkId, setPerkId,
    perks, setPerks,
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
