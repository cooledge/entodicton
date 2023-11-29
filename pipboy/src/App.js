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
import ItemList from './WeaponList'

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

  const [currentWeaponId, setCurrentWeaponId] = useState()

  const [weaponId, setWeaponId] = useState(character.weapons[0].id);
  const [weapons, setWeapons] = useState(character.weapons)

  const [health, setHealth] = useState(character.health)
  const [messageContent, setMessageContent] = useState()

  const [selectingWeapon, setSelectingWeapon] = useState(false)
  const [selectingWeaponId, setSelectingWeaponId] = useState()

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

  const select = () => {
    if (selectingWeapon) {
      setCurrentWeaponId(selectingWeaponId)
      setSelectingWeapon(false)
      return
    }
    if (activeTab === 'stat') {
      if (activeStatTab === 'special') {
        // moveTo(direction, specialId, setSpecialId, special)
      } else if (activeStatTab === 'perks') {
        // moveTo(direction, perkId, setPerkId, perks)
      }
    } else if (activeTab === 'inv') {
      if (activeInvTab === 'weapons') {
        setCurrentWeaponId(weaponId)
      } else if (activeInvTab === 'apparel') {
        // moveTo(direction, apparelId, setApparelId, apparel)
      } else if (activeInvTab === 'aid') {
        // moveTo(direction, aidId, setAidId, aid)
      }
    }
  }

  const cancel = () => {
    if (selectingWeapon) {
      setSelectingWeapon(false)
    }
  }

  const move = (direction) => {
    if (selectingWeapon) {
      moveTo(direction, selectingWeaponId, setSelectingWeaponId, weapons)
      return
    }
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
    const n = [health.arm.left, health.arm.right, health.leg.left, health.leg.right, health.torso, health.head].map( (value) => value < 100 ? 1 : 0 ).reduce((x,y) => x+y)
    if (n === 0) {
      return
    }
    const delta = potency / n;
    setHealth({
      arm: {
        left: Math.min(health.arm.left+delta, 100),
        right: Math.min(health.arm.right+delta, 100),
      },
      leg: {
        left: Math.min(health.leg.left+delta, 100),
        right: Math.min(health.leg.right+delta, 100),
      },
      torso: Math.min(health.torso+delta, 100),
      head: Math.min(health.head+delta, 100),
    })
  }

  console.log('in app selectingWeaponId', selectingWeaponId)
  const props = {
    activeTab, setActiveTab,
    activeStatTab, setActiveStatTab,
    activeInvTab, setActiveInvTab,
    health, setHealth,

    lastQuery, setLastQuery,
    move, select, cancel,
    getWeapon,
    applyStimpack,

    currentWeaponId, setCurrentWeaponId,
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


  props.changeWeapon = () => {
    setSelectingWeaponId(weapons[0].id)
    setSelectingWeapon(true)
  }
  props.changeWeapon = props.changeWeapon.bind(this)

  return (
    <div className="App">
      <Speech {...props} />
      <Message show={selectingWeapon} setShow={setSelectingWeapon}>
        <h1>Arm with a new weapon</h1>
        <WeaponList {...props} weaponId={selectingWeaponId} setWeaponId={setSelectingWeaponId}/>
      </Message>
      <Header activeTab={activeTab} setActiveTab={setActiveTab}/>
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
