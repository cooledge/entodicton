import React, { useEffect, useState } from "react";
import './css/reminders.css'
import Text from './Text'
import makeAPI from './API'
import Reminders from './Reminders'
import Users from './Users'
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
  const [lastQuery, setLastQuery] = useState('')
  const [km, setKM] = useState()
  const [currentId, setCurrentId] = useState()
  const [reminders, setReminders] = useState([])

  const incrementCounter = () => {
    setCounter(counter+1)
  }

  useEffect( () => {
    const init = async () => {
      const km = await tpmkms.reminders();
      await km.setApiKMs(['reminders', 'ui'])
      await km.add(tpmkms.ui)
      km.stop_auto_rebuild()
        await km.setApi(() => makeAPI(km))
        // km.kms.ui.api = km.api
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
  }, [km, setCounter, setCurrentId])

  const props = {
    lastQuery, setLastQuery,
    message, setMessage,
    km,
    incrementCounter,
    reminders, setReminders,
    currentId, setCurrentId,
  }

  const onClickTesting = async () => {
    console.log('onClickTesting')
    km.kms.time.api.now = () => new Date(2025, 5, 29, 14, 52, 0)
  }

  return (
    <div className='App'>
      <div className='Links'>
        <a style={{'marginLeft': '30px', 'marginTop': '20px'}} href={'https://youtu.be/KHMlsost7pw'} target="_blank" rel="noreferrer">YouTube Demo of Using This POC Page</a>
        <a style={{'marginLeft': '30px', 'marginTop': '20px'}} href={'https://github.com/cooledge/entodicton/blob/master/reminders/src/API.js'} target="_blank" rel="noreferrer">
          Source Code of API for this page
        </a>
      </div>
      <button id='testingButton' onClick={onClickTesting} style={{opacity: 0}}>Press this for testing mode</button>
      <span id={`queryCounter${counter}`} style={{display: 'none'}}>{counter}</span>
      <Text {...props} />
      <Reminders mode="horizontal" currentId={currentId} setCurrentId={setCurrentId} reminders={reminders} setMessage={setMessage} openAnimation="slide-up"/>
      <Users km={km}/>
    </div>
  )
}

export default App;
