import { useMemo, useEffect, useState } from 'react'
import { Button } from 'react-native'
import InputWithDropdown from './InputWithDropdown';
const demo = require('./demo.json')

function Text(props) {
  const { km, setMessage } = props
  const [ query, setQuery ] = useState('')
  const [ selectedOption, setSelectedOption ] = useState()

  const msg = useMemo( () => new SpeechSynthesisUtterance(), [] )

  if (km) {
    // km.api.setProps(props)
    km.api.initialize(props)
    km.getConfigs().ui.api.initialize(props)
  }

  useEffect( () => {
    if (query === '') {
      return
    }
    km.api.say('')
    const doQuery = async () => {
      debugger
      return km.process(query.toLowerCase()).then( async (result) => {
        let message = ''
        let hasError = false
        setQuery('')
        if (result.error) {
          console.log(result.error)
        } else {
          for (let i = 0; i < result.contexts.length; ++i) {
            if (result.contexts[i].marker === 'error') {
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
          // console.log(result)
          if (hasError) {
            for (const response of result.responses) {
              console.log('responses', response)
            }
          }
          if (message) {
            km.api.say(message)
            msg.text = message
            window.speechSynthesis.speak(msg)
          }
        }
        props.incrementCounter()
      }).catch( (e) => {
      }
      );
    }
    doQuery()
  }, [query, msg])

  const onClick = () => {
    const query = document.getElementById('query').value.toLowerCase()
    document.getElementById('query').value = ''
    setQuery(query)
  }

  const keyPressed = (event) => {
    if (event.key === 'Enter') {
      onClick()
    }
  }

  const info = km ? km.getInfo() : { examples: [] }
  const options = []
  for (let example of info.examples) {
    options.push({ value: example, label: example })
  }
  const handleChange = (query) => {
    setSelectedOption(null)
    setQuery(query.value)
  };

  return (
    <div className="Speech">
      { km && 
        <>
          <div>
            Request <InputWithDropdown options={demo.samples} id='query' autoFocus={true} onKeyDown ={ keyPressed } type='text' className='request' />
            <a style={{"marginLeft": "10px"}} className="Button" id='submit' onClick={onClick}>Submit</a>
          </div>
        </>
      }
    </div>
  );
}

export default Text;
