import { useMemo, useEffect, useState } from 'react'
import { Button } from 'react-native'
/*
import FastFoodAPI from './FastFoodAPI'
console.time('load')
const tpmkms = require('tpmkms_4wp')
console.timeEnd('load')
*/

function Text(props) {
  const { fastfood, setMessage } = props
  const [ query, setQuery ] = useState('')
  const [ selectedOption, setSelectedOption ] = useState()

  const msg = useMemo( () => new SpeechSynthesisUtterance(), [] )

  if (fastfood) {
    fastfood.api.setProps(props)
  }

  // fastfood.getConfigs().ui.api.setProps(props)
  useEffect( () => {
    if (query === '') {
      return
    }
    fastfood.api.say('')
    const doQuery = async () => {
      return fastfood.process(query.toLowerCase()).then( async (result) => {
        let message = ''
        let hasError = false
        setQuery('')
        if (result.error) {
          console.log(result.error)
        } else {
          for (let i = 0; i < result.contexts.length; ++i) {
            if (result.contexts[i].marker === 'error') {
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

  const info = fastfood ? fastfood.getInfo() : { examples: [] }
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
      { fastfood && 
        <>
          <div>
            Request <input id='query' placeholder='press enter to submit.' autoFocus={true} onKeyDown ={ keyPressed } type='text' className='request' />
            <a style={{"margin-left": "10px"}} className="Button" id='submit' onClick={onClick}>Submit</a>
          </div>
          <div>
            <span class='paraphrase'>{ query }</span>
          </div>
        </>
      }
    </div>
  );
}

export default Text;
