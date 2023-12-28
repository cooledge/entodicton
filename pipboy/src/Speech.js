import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import parameters from './parameters'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
const { pipboy, ui } = require('tpmkms_4wp')

class API {
  // id in stats, inv, data, map, radio
  setDisplay(id) {
    // this.objects.display = id
    if (['stat', 'inv', 'data', 'map', 'radio'].includes(id)) {
      this.props.setActiveTab(id)
    } else if (['weapon', 'apparel', 'aid'].includes(id)) {
      this.props.weaponsFilter(() => () => true)
      this.props.setActiveTab('inv')
      if (id == 'weapon') {
        id = 'weapons'
      }
      this.props.setActiveInvTab(id)
    } else if (['status', 'special', 'perks'].includes(id)) {
      this.props.setActiveTab('stat')
      this.props.setActiveStatTab(id)
    }
  }

  showWeapons(id) {
    if (id == 'weapon') {
      this.props.weaponsFilter(() => () => true)
      this.props.setActiveTab('inv')
      this.props.setActiveInvTab('weapons')
    }
  }

  setWeapon(id) {
  }

  getWeapons() {
  }

  // what: apparel, weapon
  change(what) {
    this.props.changeWeapon()
    // callback to pass the list to the API
  }

  handleSelect({what, categories, items, selectItem, currentMessage, filter, choicesTab}) {
    if (categories.includes(what)) {
      const selected = items.filter(filter)
      if (selected.length == 0) {
        this.props.setMessage(`There are none.`)
      } else if (selected.length == 1) {
        selectItem(selected[0].id)
        this.props.setMessage(currentMessage(selected))
      } else {
        choicesTab()
      }
      return
    }
    this.props.setMessage(`${what}. What's that?!?!`)
  }

  useAid({type, name, description}) {
    const what = type
    const categories = this.props.aidCategories
    const items = this.props.aid
    const selectItem = this.props.selectAid
    const currentMessage = (selected) => `Put on ${selected[0].name}.`
    const filter = (item) => item.categories.includes(what)
    const choicesTab = () => {
      this.props.setAidFilter(() => filter)
      this.props.setActiveTab('inv')
      this.props.setActiveInvTab('aid')
      this.props.setMessage('Which one?')
    }

    this.handleSelect({what, categories, items, selectItem, currentMessage, filter, choicesTab})
  }

  drink(type) {
    this.useAid({type, description: (what) => `Drinking ${what}`})
  }

  eat(type) {
    debugger
    this.useAid({type, description: (what) => `Eating ${what}`})
  }

  take(type) {
    this.useAid({type, description: (what) => `Taking ${what}`})
  }

  wear({type, name}) {
    if (type == 'outfit') {
      this.props.wearOutfit(name)
      return
    }
    const what = type
    const categories = this.props.apparelCategories
    const items = this.props.apparel
    const selectItem = this.props.selectApparel
    const currentMessage = (selected) => `Put on ${selected[0].name}.`
    const filter = (item) => item.categories.includes(what)
    const choicesTab = () => {
      this.props.setApparelFilter(() => filter)
      this.props.setActiveTab('inv')
      this.props.setActiveInvTab('apparel')
      this.props.setMessage('Which one?')
    }

    this.handleSelect({what, categories, items, selectItem, currentMessage, filter, choicesTab})
  }

  equip(what) {
    const categories = this.props.weaponsCategories
    const items = this.props.weapons
    const selectItem = this.props.selectWeapon
    const currentMessage = (selected) => `The current weapon is now ${selected[0].name}.`
    const filter = (item) => item.categories.includes(what)
    const choicesTab = () => {
      this.props.setWeaponsFilter(() => filter)
      this.props.setActiveTab('inv')
      this.props.setActiveInvTab('weapons')
      this.props.setMessage('Which one?')
    }

    this.handleSelect({what, categories, items, selectItem, currentMessage, filter, choicesTab})
  }

  apply({ item, quantity }) {
    if (item === 'stimpak') {
      this.props.applyStimpak(quantity)
    }
  }

  initialize(props) {
    this.props = props
  }

  move(direction, steps = 1) {
    this.props.move(direction, steps)
  }

  unselect() {
    this.props.select(true)
  }

  select() {
    this.props.select()
  }

  strip() {
    this.props.strip()
  }

  disarm() {
    this.props.disarm()
  }

  setName(item, name) {
    this.props.setOutfitName(name)
  }

  cancel() {
    this.props.cancel()
  }
}

pipboy.api = new API()
ui.api = pipboy.api
pipboy.add(ui)
const url = `${new URL(window.location.href).origin}/entodicton`
pipboy.config.url = url
pipboy.server(url)

let processing = false

function Speech(props) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect( () => {
    if (browserSupportsSpeechRecognition) {
      SpeechRecognition.startListening()
    }
  }, [])

  const { lastQuery, setLastQuery } = props
  const [ query, setQuery ] = useState('')

  pipboy.api.initialize(props)
  pipboy.getConfigs().ui.api.initialize(props)

  const onClick = () => {
    const query = document.getElementById('query').value
    pipboy.process(query)
  }
  if (!processing && !listening && transcript) {
    setLastQuery(transcript)
    processing = true
    pipboy.process(transcript.toLowerCase()).then( () => {
      processing = false
      SpeechRecognition.startListening()
    }).catch( (e) => {
      console.log('got error--------------------------------------------', e)
      processing = false
      SpeechRecognition.startListening()
    });
  }

  const keyPressed = (event) => {
        if (event.key === 'Enter') {
          onClick()
        }
      }

  return (
    <div className="Speech">
      <div hidden={!browserSupportsSpeechRecognition}>
        Request <input id='query' placeholder='some queries are below.' onKeyDown ={ keyPressed } type='text' className='request' />
        <Button id='submit' variant='contained' onClick={onClick}>Submit</Button>
      </div>
      {browserSupportsSpeechRecognition &&
        <>
          <span>Speech recognizer is { listening ? "on" : "off" }</span>
          <br/>
          <span>{ lastQuery }</span>
        </>
      }
    </div>
  );
}

export default Speech;
