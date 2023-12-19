import React, { useState } from 'react';
import Stat from './Stat'
import ToDo from './ToDo'
import Inv from './Inv'
import Data from './Data'
import Radio from './Radio'
import Footer from './Footer'
import Header from './Header'
import Message from './Message'
import character from './character.json'
import WeaponList from './WeaponList'
import Popup from './Popup'

/*
  head, larm, rarm, lleg, rleg, torso, feet, hands, eyes
*/
function overlaps(covers1, covers2) {
  for (let cover1 of covers1) {
    if (covers2.includes(cover1)) {
      return true
    }
  }
  return false
}

let selector;
function App() {
  const setSelector = (value) => selector = value()

  const [activeTab, setActiveTab] = useState('stat');
  const [activeStatTab, setActiveStatTab] = useState('status')
  const [activeInvTab, setActiveInvTab] = useState('weapons')
  const [activeDataTab, setActiveDataTab] = useState('quests')

  //const [selector, setSelector] = useState()
  const [message, setMessage] = useState()

  const [questId, setQuestId] = useState(character.quests[0].id);
  const [quests, setQuests] = useState(character.quests);

  const [radioStationId, setRadioStationId] = useState(character.radioStations[0].id);
  const [radioStations, setRadioStations] = useState(character.radioStations);

  const [outfits, setOutfits] = useState({});

  const [perkId, setPerkId] = useState(character.perks[0].id);
  const [perks, setPerks] = useState(character.perks);

  const [specialId, setSpecialId] = useState(character.special[0].id);
  const [special, setSpecial] = useState(character.special);

  const [apparelId, setApparelIdDirect] = useState(character.apparel[0].id);
  const [apparel, setApparel] = useState(character.apparel);

  const [aidId, setAidIdDirect] = useState(character.aid[0].id);
  const [aid, setAid] = useState(character.aid);

  const [weaponId, setWeaponIdDirect] = useState(character.weapons[0].id);
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

  const selectAid = (id, unselect) => {
    if (unselect) {
      setMessage("Aid is not unselectable")
      return
    }
    const index = aid.findIndex( (item) => item.id === id )
    const newAid = aid.map( (item) => {
        if (item.id === id) {
          item.quantity -= 1
        }
        return item.quantity > 0 ? item : null
      }).filter((item) => item)
    if (newAid[index]) {
      setAidId(newAid[index].id)
    } else if (newAid[index-1]) {
      setAidId(newAid[index-1].id)
    } else {
      setAidId(null)
    }
    setAid(newAid)
  }

  const setAidId = (id) => {
    setAidIdDirect(id)
    setSelector(() => (unselect) => selectAid(id))
  }

  const selectWeapon = (id, unselect) => {
    if (unselect) {
      setWeapons(weapons.map( (weapon) => {
          if (weapon.id === id) {
            weapon.selected = false
          } 
          return weapon
        })
      )
      return
    }
    setWeapons(weapons.map( (weapon) => {
        if (weapon.id === id) {
          weapon.selected = true
        } else {
          weapon.selected = false
        }
        return weapon
      })
    )
  }

  const setWeaponId = (id) => {
    setWeaponIdDirect(id)
    setSelector(() => (unselect) => selectWeapon(id))
  }

  const selectApparel = (id, unselect) => {
    if (unselect) {
      const app = apparel.find( (item) => item.id === id )
      setApparel(apparel.map( (item) => {
          if (item.id === id) {
            item.selected = false
          }
          return item
        })
      )
      return
    }
    const app = apparel.find( (item) => item.id === id )
    setApparel(apparel.map( (item) => {
        if (item.id === id) {
          item.selected = true
        } else {
          if (overlaps(app.covers, item.covers)) {
            item.selected = false
          }
        }
        return item
      })
    )
  }

  const setApparelId = (id) => {
    setApparelIdDirect(id)
    setSelector(() => (unselect) => selectApparel(id))
  }

  // direction: up/down
  const moveTo = (direction, id, setId, items, steps = 1) => {
    const index = items.findIndex((item) => item.id === id)
    let toId;
    if (direction === 'down') {
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

  const select = (...args) => {
    if (selectingWeapon) {
      weapons.forEach((weapon) => {
        weapon.selected = selectingWeaponId === weapon.id
      })
      return
    } else {
      console.log('selector', selector)
      if (selector) {
        console.log('calling selector')
        selector(...args)
      }
    }
    /*
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
    */
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

  const applyStimpak = (quantity) => {
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
    const stimpak = aid.find( aid => aid.id == 'Stimpak' )
    if (!stimpak || stimpak.quantity < quantity) {
      if (stimpak) {
        setMessage(`There are only ${stimpak.quantity} stimpaks.`)
        return
      } else {
        setMessage(`There are no stimpaks!`)
        return
      }
    }
    const aidPrime = aid.map( (aid) => {
      if (aid.id === 'Stimpak') {
        aid = { ...aid, quantity: aid.quantity - quantity }
      }
      return aid
    })
    setAid(aidPrime.filter( (aid) => aid.quantity > 0 ))
  }

  let currentWeight = 0
  aid.forEach( (item) => currentWeight += item.weight )
  weapons.forEach( (item) => currentWeight += item.weight )
  apparel.forEach( (item) => currentWeight += item.weight )
  currentWeight = currentWeight.toFixed(0)

  const props = {
    selector, setSelector,
    message, setMessage,

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

    outfits, setOutfits,

    questId, setQuestId,
    quests, setQuests,

    radioStationId, setRadioStationId,
    radioStations, setRadioStations,

    lastQuery, setLastQuery,
    move, select, cancel,
    getWeapon,
    applyStimpak,

    weaponId, setWeaponId,
    weapons, setWeapons,
    selectWeapon,

    currentWeapon: () => weapons.find( (w) => w.selected ),

    apparelId, setApparelId,
    apparel, setApparel,
    selectApparel,

    aidId, setAidId,
    aid, setAid,
    selectAid,

    specialId, setSpecialId,
    special, setSpecial,

    perkId, setPerkId,
    perks, setPerks,
  }

  props.setOutfitName = (name) => {
    const currentApparel = apparel.filter( (item) => item.selected ).map( (item) => item.id )
    const currentWeapons = weapons.filter( (item) => item.selected ).map( (item) => item.id )
    const newOutfits = { ...outfits }
    newOutfits[name] = { apparel: currentApparel, weapons: currentWeapons }
    setOutfits(newOutfits)
  }

  props.disarm = () => {
    setWeapons(weapons.map((item) => { return { ...item, selected: false } }))
  }

  props.strip = () => {
    setApparel(apparel.map((item) => { return { ...item, selected: false } }))
  }

  props.wearOutfit = (name) => {
    if (!outfits[name]) {
      setMessage(`There is no outfit named ${name} outfit`)
      return
    }
    const newApparel = apparel.map((item) => { return { ...item, selected: outfits[name].apparel.includes(item.id) } })
    const newWeapons = weapons.map((item) => { return { ...item, selected: outfits[name].weapons.includes(item.id) } })
    setApparel(newApparel)
    setWeapons(newWeapons)
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
      { message && 
        <Popup> 
          {message}
        </Popup>
      }
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
