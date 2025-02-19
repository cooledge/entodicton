import { useMemo, useEffect, useState } from 'react'
import { Button } from 'react-native'

function Text(props) {
  const { km, setMessage } = props
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
    km.api.say('')
    const doQuery = async () => {
      return km.process(query.toLowerCase()).then( async (result) => {
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
          console.log(result)
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

  /*
          <div>
            <span className='paraphrase'>{ query }</span>
          </div>
  */
  return (
    <div className="Speech">
      { km && 
        <>
          <div>
            Request <input id='query' placeholder='press enter to submit.' autoFocus={true} onKeyDown ={ keyPressed } type='text' className='request' />
            <a style={{"marginLeft": "10px"}} className="Button" id='submit' onClick={onClick}>Submit</a>
          </div>
        </>
      }
    </div>
  );
}

export default Text;
