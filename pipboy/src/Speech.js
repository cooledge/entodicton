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
    } else if (['weapons', 'apparel', 'aid'].includes(id)) {
      this.props.setActiveTab('inv')
      this.props.setActiveInvTab(id)
    } else if (['status', 'special', 'perks'].includes(id)) {
      this.props.setActiveTab('stat')
      this.props.setActiveStatTab(id)
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

  select() {
    this.props.select()
  }

  wear(name) {
    this.props.wearOutfit(name)
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
pipboy.server(parameters.thinktelligence.url)

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
