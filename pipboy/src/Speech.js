import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import parameters from './parameters'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
const { pipboy } = require('tpmkms_4wp')

class API {
  // id in stats, inv, data, map, radio
  setDisplay(id) {
    // this.objects.display = id
    console.log("calling setActive with ", id)
    if (['stat', 'inv', 'data', 'map', 'radio'].includes(id)) {
      this.props.setActiveTab(id)
    } else if (['weapons', 'armor', 'aid'].includes(id)) {
      this.props.setActiveTab('inv')
      this.props.setInvTag(id)
    } else if (['status', 'special', 'perks'].includes(id)) {
      this.props.setActiveTab('stat')
      this.props.setActiveStatTab(id)
    }
  }

  setWeapon(id) {
  }

  getWeapons() {
  }

  // what: armor, weapon
  change(what) {
    debugger
    console.log('this.props.weapons', JSON.stringify(this.props.weapons))
    this.props.changeWeapon()
    // callback to pass the list to the API
  }

  apply(item) {
    if (item.item == 'stimpack') {
      this.props.applyStimpack(item)
    }
  }

  initialize(props) {
    this.props = props
  }
}

pipboy.api = new API()
pipboy.server(parameters.thinktelligence.url)

function Speech(args) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const [lastQuery, setLastQuery] = useState('')

  useEffect( () => {
    if (browserSupportsSpeechRecognition) {
      SpeechRecognition.startListening()
    }
  }, [])

  pipboy.api.initialize(args)
  const { activeTab, setActiveTab } = args
  const [ processing, setProcessing ] = useState(false)
  console.log('transcript', transcript)
  console.log('listening', listening)
  console.log('processing', processing)
  const [ query, setQuery ] = useState('')
  const onClick = () => {
    console.log('clicked', query)
    pipboy.process(query)
  }

  if (!processing && !listening && transcript) {
    console.log('doing processing', transcript)
    setLastQuery(transcript)
    setProcessing(true)
    pipboy.process(transcript).then( () => {
      console.log('got result-------------------------------------------')
      setProcessing(false)
      SpeechRecognition.startListening()
      console.log("after start listening")
    }).catch( (e) => {
      console.log('got error--------------------------------------------', e)
      setProcessing(false)
      SpeechRecognition.startListening()
    });
  }

  const keyPressed = (event) => {
        if (event.key === 'Enter') {
          onClick()
        } else {
          setQuery(query + event.key)
        }
      }

  return (
    <div className="Speech">
      {!browserSupportsSpeechRecognition &&
        <div>
          Request <input id='query' placeholder='some queries are below.' onKeyPress={ keyPressed } type='text' value={query} className='request' />
          <Button id='submit' variant='contained' onClick={onClick}>Submit</Button>
        </div>
      }
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
