import { useMemo, useEffect, useState } from 'react';
import { Button } from 'react-native';
import parameters from './parameters'
import products from './products.json';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
const tpmkms = require('tpmkms_4wp')

class FastFoodAPI {
  initialize({ objects }) {
    this.objects = objects
    this.objects.items = []
  }

  setProps(props) {
    this.props = props
  }

  // from fastfood

  add(item) {
    this.objects.items.push(item)
    for (let i = 0; i < this.objects.items.length; ++i) {
      this.objects.items[i].index = i+1
    }
    this.props.setOrder([...this.objects.items])
  }

  say(message) {
    console.log('say', message)
  }

  getCombo(number) {
    return products.combos[`${number}`]
  }
}

class UIAPI {
  initialize({ objects }) {
  }

  setProps(props) {
    this.props = props
  }

  move(direction, steps = 1) {
    // this.props.move(direction, steps)
  }

  unselect() {
    // this.props.select(true)
  }

  select() {
    // this.props.select()
  }

  strip() {
    // this.props.strip()
  }

  disarm() {
    // this.props.disarm()
  }

  setName(item, name) {
    // this.props.setOutfitName(name)
  }

  cancel() {
    // this.props.cancel()
  }

}

const ui = tpmkms.ui()
ui.api = new UIAPI()

const fastfood = tpmkms.fastfood()
fastfood.api = new FastFoodAPI()

fastfood.add(ui)
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
  }, [browserSupportsSpeechRecognition])

  const { lastQuery, setLastQuery } = props
  // const { order, setOrder } = props
  const [ query, setQuery ] = useState('')

  const msg = useMemo( () => new SpeechSynthesisUtterance(), [] )

  fastfood.api.setProps(props)
  fastfood.getConfigs().ui.api.setProps(props)
  // setOrder(fastfood.api.objects.items)
  useEffect( () => {
    if (query === '') {
      return
    }
    const doQuery = async () => {
      return fastfood.process(query.toLowerCase()).then( (result) => {
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
          fastfood.api.say(message)
          msg.text = message
          window.speechSynthesis.speak(msg)
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

    doQuery()
    setQuery('')
  }, [query, msg])

  const onClick = () => {
    const query = document.getElementById('query').value.toLowerCase()
    setQuery(query)
  }

  const onRestart = () => {
    SpeechRecognition.startListening()
  }

  if (!processing && !listening && transcript) {
    setLastQuery(transcript)
    processing = true
    // setQuery(transcript)
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
