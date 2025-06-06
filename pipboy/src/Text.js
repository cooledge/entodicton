import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import InputWithDropdown from './InputWithDropdown';
const demo = require('./demo.json')

function Text(props) {
  const { lastQuery, setMessage, pipboy } = props
  const [ query, setQuery ] = useState('')

  if (pipboy) {
    pipboy.api.initialize(props)
    pipboy.getConfigs().ui.api.initialize(props)
  }

  useEffect( () => {
    if (query === '') {
      return
    }
    const doQuery = async () => {
      pipboy.process(query.toLowerCase()).then( (result) => {
        console.log('result', result)
        let message = ''
        for (let i = 0; i < result.contexts.length; ++i) {
          if (result.contexts[i].isResponse) {
            message += result.responses[i] + ' '
          }
        }
        if (message) {
          setMessage(message)
        }
        props.incrementCounter()
      }).catch( (e) => {
        console.log('got error', e)
      }
      );
    }
    doQuery()
    setQuery('')
  }, [pipboy, query, setMessage])

  const onClick = () => {
    const query = document.getElementById('query').value.toLowerCase()
    console.log('doing the query', query)
    setQuery(query)
    document.getElementById('query').value = ''
  }

  const keyPressed = (event) => {
    if (event.key === 'Enter') {
      onClick()
    }
  }

  return (
    <div className="Speech">
      <div>
        Request <InputWithDropdown options={demo.samples}  id='query' autoFocus={true} onKeyDown ={ keyPressed } type='text' className='request' />
        <Button style={{"marginLeft": "10px"}} id='submit' className='button' variant='contained' onClick={onClick}>Submit</Button>
      </div>
      <div>
        <span className='paraphrase'>{ lastQuery }</span>
      </div>
    </div>
  );
}

export default Text;
