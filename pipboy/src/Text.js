import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';

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
        Request <input id='query' placeholder='press enter to submit.' autoFocus={true} onKeyDown ={ keyPressed } type='text' className='request' />
        <Button style={{"margin-left": "10px"}} id='submit' className='button' variant='contained' onClick={onClick}>Submit</Button>
      </div>
      <div>
        <span class='paraphrase'>{ lastQuery }</span>
      </div>
    </div>
  );
}

export default Text;
