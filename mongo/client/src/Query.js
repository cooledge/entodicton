import { useEffect, useState } from 'react'
import $ from 'jquery'

function Query(props) {
  const { doQuery } = props
  const [ query, setQuery ] = useState('')

  useEffect( () => {
    if (query === '') {
      return
    }
    doQuery(query)
  }, [query, doQuery])

  const onClick = () => {
    const query = document.getElementById('query').value.toLowerCase()
    document.getElementById('query').value = ''
    setQuery(query)
  }

  const doodeIt = () => {
    const sheet = window.document.styleSheets[0]
    sheet.insertRule('.banana:hover { background-color: yellow; }', sheet.cssRules.length)
    sheet.insertRule('.bananaRed { background-color: red; }', sheet.cssRules.length)
  }

  const doodeAdd = () => {
    $('.banana').addClass('bananaRed')
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
        <a style={{"marginLeft": "10px"}} className="Button" id='submit' onClick={onClick}>Submit</a>
        <a style={{"marginLeft": "10px"}} className="Button" onClick={doodeIt}>Doode it</a>
        <a style={{"marginLeft": "10px"}} className="Button" onClick={doodeAdd}>Doode Add</a>
        <div className='banana'>banana</div>
      </div>
      <div>
        <span className='paraphrase'>{ query }</span>
      </div>
    </div>
  );
}

export default Query;
