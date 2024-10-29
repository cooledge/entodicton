import { useEffect, useState } from 'react'
import $ from 'jquery'

function Query(props) {
  const { resetSession, doQuery, queryResponses } = props
  const [ query, setQuery ] = useState('')
  const [ counter, setCounter] = useState(0)

  console.log('counter --------------', counter)
  useEffect( () => {
    if (query.text === '') {
      return
    }
    doQuery({ text: query, counter })
  }, [query, doQuery, counter])

  const onClick = () => {
    const query = document.getElementById('query').value.toLowerCase()
    document.getElementById('query').value = ''
    setCounter(counter+1)
    setQuery(query)
  }

  const onResetSession = () => {
    resetSession()
  }

  const keyPressed = (event) => {
    if (event.key === 'Enter') {
      onClick()
    }
  }

  return (
    <div className="Query">
      <div>
        <span className='label'>Request:</span> <input id='query' placeholder='press enter to submit.' autoFocus={true} onKeyDown ={ keyPressed } type='text' className='request' />
        <a style={{"marginLeft": "10px"}} className="Button" id='submit' onClick={onClick}>Submit</a>
        <a style={{"marginLeft": "10px"}} className="Button" onClick={onResetSession}>Reset Session</a>
      </div>
      { query && 
        <div>
          <span className='paraphrase'><span className='label'>Paraphrase: </span><span className='field'>{ query }</span></span>
        </div>
      }
      {
        queryResponses && queryResponses.length > 0 &&
        <span className='response'><span className='label'>Query Response:</span><span className='field'>{queryResponses}</span></span>
      }
    </div>
  );
}

export default Query;
