import { useMemo, useEffect, useState } from 'react'
import { Button } from 'react-native'
import InputWithDropdown from './InputWithDropdown';
const demo = require('./demo.json')

function Text(props) {
  const { km, setMessage, message } = props
  const [ query, setQuery ] = useState('')
  const [ selectedOption, setSelectedOption ] = useState()

  const msg = useMemo( () => new SpeechSynthesisUtterance(), [] )

  if (km) {
    km.api.setProps(props)
  }

  useEffect( () => {
    if (query === '') {
      return
    }
    // km.api.say('')
    const doQuery = async () => {
      console.log('query', query)
      return km.process(query.toLowerCase()).then( async (result) => {
        let hasError = false
        let message = ''
        setQuery('')
        if (result.error) {
          console.log(result.error)
        } else {
          let seenResponses = []
          for (let i = 0; i < result.contexts.length; ++i) {
            if (result.contexts[i].marker === 'error') {
              hasError = true
              console.log(result.contexts[i])
              continue
            }
            // just show the last response
            if (i == result.contexts.length-1) {
              if (result.contexts[i].isResponse && seenResponses.findIndex((r) => r == result.responses[i]) == -1) {
                message += result.responses[i] + ' '
                seenResponses.push(result.responses[i])
              }
            }
          }
          if (hasError) {
            message += '. There are errors shown in the console'
          }
          // console.log(result)
          if (false && hasError) {
            for (const response of result.responses) {
              console.log('responses', response)
            }
          }
          if (message) {
            console.log("XXXXXXXXXXXXXXXXXXXXXXXXX message", message)
            setMessage(message)
            // km.api.say(message)
            // msg.text = message
            // window.speechSynthesis.speak(msg)
          } else {
            console.log("XXXXXXXXXXXXXXXXXXXXXXXXX message blank", message)
            setMessage('')
          }
        }
        props.incrementCounter()
      }).catch( (e) => {
        console.log('error', e)
      }
      );
    }
    doQuery()
  }, [query, msg, message, setMessage])

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
            { message && 
              <span className='response'>{message}</span>
            }
          </div>
        </>
      }
    </div>
  );
}

export default Text;
