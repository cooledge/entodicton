import { useEffect, useState } from 'react';
import { Button } from 'react-native';
import parameters from './parameters'
import products from './products.json';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
const { fastfood, ui } = require('tpmkms_4wp')

class API {
  initialize() {
    this.objects.items = []
  }

  changed() {
    this.objects.changes = this.objects.items
  }

  say(response) {
    this.objects.response = response
  }
}

const api = new API()

fastfood.add(ui)
fastfood.api = api
const url = `${new URL(window.location.href).origin}/entodicton`
fastfood.config.url = url
fastfood.server(url)

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
  const { order, setOrder } = props
  const [ query, setQuery ] = useState('')

  const msg = new SpeechSynthesisUtterance()

  // fastfood.api.initialize(props)
  // fastfood.getConfigs().ui.api.initialize(props)
  setOrder(fastfood.api.objects.items)

  const doQuery = (query) => {
    fastfood.process(query.toLowerCase()).then( (result) => {
      console.log('result', result)
      for (let response of result.responses) {
        if (response.length > 0) {
          msg.text = response
          window.speechSynthesis.speak(msg)
        }
      }
      let message = ''
      for (let i = 0; i < result.contexts.length; ++i) {
        if (result.contexts[i].isResponse) {
          message += result.responses[i] + ' '
        }
      }
      if (message) {
        props.setMessage(message)
      }
      processing = false
      SpeechRecognition.startListening()
    }).catch( (e) => {
      console.log('got error--------------------------------------------', e)
      processing = false
      SpeechRecognition.startListening()
    }
    );
  }

  const onClick = () => {
    const query = document.getElementById('query').value.toLowerCase()
    console.log('doing the query', query)
    doQuery(query)
  }

  const onRestart = () => {
    SpeechRecognition.startListening()
  }

  if (!processing && !listening && transcript) {
    setLastQuery(transcript)
    processing = true
    doQuery(transcript)
  }

  const keyPressed = (event) => {
        if (event.key === 'Enter') {
          onClick()
        }
      }

  return (
    <div className="Speech">
      <div style={{ 'flexGrow': '1' }}>
        Request <input id='query' placeholder='press enter to submit.' onKeyDown ={ keyPressed } type='text' className='request' />
        <a className="Button" id='submit' onClick={onClick}>Submit</a>
        <span style={{"marginLeft": "10px"}}>Speech recognizer is { listening ? "on" : "off" }</span>
        { !listening && !processing && browserSupportsSpeechRecognition &&
          <a className="Button" id='submit' onClick={onRestart}>Restart</a>
        }
        { !browserSupportsSpeechRecognition &&
          <span style={{"marginLeft": "10px"}} >(Chrome supports speech recognition)</span>
        }
      </div>
      <span className='paraphrase'>{ lastQuery } greg</span>
    </div>
  );
}

export default Speech;