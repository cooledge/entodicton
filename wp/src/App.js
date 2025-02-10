import React, { useEffect, useState } from 'react';
import './css/wp.css'
import Text from './Text'
import API from './API'
import RichTextEditor from './richtext'
const tpmkms = require('tpmkms_4wp')

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
]

const App = () => {
  const [query, doQuery] = useState({ text: '', counter: 0 })
  const [counter, setCounter] = useState(0)
  const [queryResponses, setQueryResponses] = useState([])
  const [message, setMessage] = useState()
  const [lastQuery, setLastQuery] = useState('');
  const [km, setKM] = useState()

  const incrementCounter = () => {
    setCounter(counter+1)
  }

  useEffect( () => {
    const init = async () => {
      const km = await tpmkms.wp()
      km.stop_auto_rebuild()
        await km.setApi(() => new API(setCounter))
        km.config.debug = true
        const url = `${new URL(window.location.href).origin}/entodicton`
        km.config.url = url
        km.server(url)
      await km.restart_auto_rebuild()
      setKM(km)
    }

    if (!km) {
      init()
    }
  }, [km, setCounter])

  const props = {
    lastQuery, setLastQuery,
    message, setMessage,
    km,
    incrementCounter,
  }

  const doit = () => {
    console.log("hello world!!!!!!!!!!!!!!!!!!!!!!!!")
  }

  return (
    // Add the editable component inside the context.
    <div className='App'>
      <span id={`queryCounter${counter}`} style={{display: 'none'}}>{counter}</span>
      <RichTextEditor textProps={props}/>
    </div>
  )
}

export default App;
