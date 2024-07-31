import { useEffect, useState } from 'react'

function Query(props) {
  const { doQuery } = props
  const [ query, setQuery ] = useState('')

  useEffect( () => {
    if (query === '') {
      return
    }
    doQuery(query)
  }, [query])

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

  return (
    <div className="Speech">
      <div>
        Request <input id='query' placeholder='press enter to submit.' autoFocus={true} onKeyDown ={ keyPressed } type='text' className='request' />
        <a style={{"margin-left": "10px"}} className="Button" id='submit' onClick={onClick}>Submit</a>
      </div>
      <div>
        <span class='paraphrase'>{ query }</span>
      </div>
    </div>
  );
}

export default Query;
