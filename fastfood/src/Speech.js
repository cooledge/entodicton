import { useMemo, useEffect, useState } from 'react';
import { Button } from 'react-native';
import parameters from './parameters'
import products from './products.json';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
const tpmkms = require('tpmkms_4wp')

class XFastFoodAPI {
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

  hasAskedForButNotAvailable(item) {
    debugger
    return true
 }
}

class FastFoodAPI {
  initialize({ objects, config }) {
    this._objects = objects
    this._objects.items = []
    this._objects.notAvailable = []
  }

  setProps(props) {
    this.props = props
  }

  show() {
    this._objects.show = this._objects.items
  }

  // add({ name, combo, modifications }) {
  add(item) {
    // this._objects.items.push({ name, combo, modifications })
    this._objects.items.push(item)
    for (let i = 0; i < this._objects.items.length; ++i) {
      this._objects.items[i].index = i+1
    }
    debugger
    this.props.setOrder([...this._objects.items])
  }

  say(message) {
    // this._objects.response = response
    console.log('say', message)
  }

  // return true if you want the NLI layer to handle this
  hasAskedForButNotAvailable(item) {
    return this._objects.notAvailable.length > 0
  }

  getAskedForButNotAvailable(item) {
    const na = this._objects.notAvailable
    this._objects.notAvailable = []
    return na
  }

  addAskedForButNotAvailable(item) {
    this._objects.notAvailable.push(item)
  }

  isAvailable(id) {
    return [
      "double",
      "french_fry",
      "single",
      "triple",
      'baconator',
      'bacon_deluxe',
      'spicy',
      'homestyle',
      'asiago_range_chicken_club',
      'ultimate_chicken_grill',
      '10_peice_nuggets',
      'premium_cod',
      "waffle_fry",
      "strawberry_smoothie",
      "guava_smoothie",
      "mango_passion_smoothie",
      "wild_berry_smoothie",
      "strawberry_banana_smoothie",
    ].includes(id)
  }

  getCombo(number) {
    debugger
    const map = {
      1: 'single',
      2: 'double',
      3: 'triple',
      4: 'baconator',
      5: 'bacon_deluxe',
      6: 'spicy',
      7: 'homestyle',
      8: 'asiago_range_chicken_club',
      9: 'ultimate_chicken_grill',
      10: '10_peice_nuggets',
      11: 'premium_cod',
    }
    return map[number]
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
fastfood.config.debug = true
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
        /*
        console.log(result)
        
        for (let index in result.responses) {
          if (result.contexts[index].marker == 'error') {
            console.log('error', result.contexts[index])
            continue
          }
          const response = result.responses[index]
          if (response.length > 0) {
            msg.text = response
            window.speechSynthesis.speak(msg)
          }
        }
        */

        let message = ''
        let hasError = false
        for (let i = 0; i < result.contexts.length; ++i) {
          if (result.contexts[i].marker == 'error') {
            console.log('error', result.contexts[i])
            hasError = true
            continue
          }
          if (result.contexts[i].isResponse) {
            message += result.responses[i] + ' '
          }
        }
        if (hasError) {
          message += '. There are errors shown in the console'
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
