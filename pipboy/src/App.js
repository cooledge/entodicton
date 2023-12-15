import React, { useState } from 'react';
import Stat from './Stat'
import ToDo from './ToDo'
import Inv from './Inv'
import Data from './Data'
import Radio from './Radio'
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
  const [activeDataTab, setActiveDataTab] = useState('quests')

  const [questId, setQuestId] = useState(character.quests[0].id);
  const [quests, setQuests] = useState(character.quests);

  const [radioStationId, setRadioStationId] = useState(character.radioStations[0].id);
  const [radioStations, setRadioStations] = useState(character.radioStations);

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

  const [hp, setHP] = useState(character.hp)
  const [ap, setAP] = useState(character.ap)
  const [caps, setCaps] = useState(character.caps)
  const [health, setHealth] = useState(character.health)
  const [maxWeight, setMaxWeight] = useState(character.maxWeight)
  const [messageContent, setMessageContent] = useState()

  const [selectingWeapon, setSelectingWeapon] = useState(false)
  const [selectingWeaponId, setSelectingWeaponId] = useState()

  const [lastQuery, setLastQuery] = useState('');

  const getWeapon = (id) => {
    return weapons.find( (weapon) => weapon.id === id )
  }

  // direction: up/down
  const moveTo = (direction, id, setId, items, steps = 1) => {
    const index = items.findIndex((item) => item.id === id)
    let toId;
    if (direction === 'down') {
      debugger;
      if (index+1 < items.length)
        toId = items[Math.min(index+steps, items.length-1)].id
    } else {
      if (index-1 >= 0)
        toId = items[Math.max(index-steps, 0)].id
    }
    if (toId) {
      setId(toId)
    }
  }

  const select = () => {
    if (selectingWeapon) {
      weapons.forEach((weapon) => {
        weapon.selected = selectingWeaponId === weapon.id
      })
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
        weapons.forEach((weapon) => {
          weapon.selected = weaponId === weapon.id
        })
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

  const move = (direction, steps) => {
    if (selectingWeapon) {
      moveTo(direction, selectingWeaponId, setSelectingWeaponId, weapons, steps)
      return
    }
    if (activeTab === 'stat') {
      if (activeStatTab === 'special') {
        moveTo(direction, specialId, setSpecialId, special, steps)
      } else if (activeStatTab === 'perks') {
        moveTo(direction, perkId, setPerkId, perks, steps)
      }
    } else if (activeTab === 'inv') {
      if (activeInvTab === 'weapons') {
        moveTo(direction, weaponId, setWeaponId, weapons, steps)
      } else if (activeInvTab === 'apparel') {
        moveTo(direction, apparelId, setApparelId, apparel, steps)
      } else if (activeInvTab === 'aid') {
        moveTo(direction, aidId, setAidId, aid, steps)
      }
    }
  }

  const applyStimpack = (request) => {
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

  let currentWeight = 0
  aid.forEach( (item) => currentWeight += item.weight )
  weapons.forEach( (item) => currentWeight += item.weight )
  apparel.forEach( (item) => currentWeight += item.weight )
  currentWeight = currentWeight.toFixed(0)

  const props = {
    maxWeight, setMaxWeight,
    currentWeight,

    activeTab, setActiveTab,
    activeStatTab, setActiveStatTab,
    activeInvTab, setActiveInvTab,
    activeDataTab, setActiveDataTab,
    hp, setHP,
    ap, setAP,
    caps, setCaps,
    health, setHealth,

    questId, setQuestId,
    quests, setQuests,

    radioStationId, setRadioStationId,
    radioStations, setRadioStations,

    lastQuery, setLastQuery,
    move, select, cancel,
    getWeapon,
    applyStimpack,

    weaponId, setWeaponId,
    weapons, setWeapons,

    currentWeapon: () => weapons.find( (w) => w.selected ),

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
      <Message show={selectingWeapon} setShow={setSelectingWeapon}>
        <h1>Arm with a new weapon</h1>
        <WeaponList {...props} weaponId={selectingWeaponId} setWeaponId={setSelectingWeaponId}/>
      </Message>
      <Header {...props}/>
      { activeTab === 'stat' && <Stat {...props }/> }
      { activeTab === 'inv' && <Inv { ...props }/> }
      { activeTab === 'data' && <Data { ...props } /> }
      { activeTab === 'map' && <ToDo { ...props }/> }
      { activeTab === 'radio' && <Radio { ...props } /> }
      <Footer {...props}/>
    </div>
  );
}

export default App;
