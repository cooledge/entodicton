import React, { useEffect, useState } from "react";
import './css/reminders.css'
import Text from './Text'
import makeAPI from './API'
import Reminders from './Reminders'
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
  const [reminders, setReminders] = useState([ 
    { text: 'go to the store', date: 'monday' },
    { text: 'buy bananas', date: 'tuesday' },
  ])

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
  }, [km, setCounter])

  const props = {
    lastQuery, setLastQuery,
    message, setMessage,
    km,
    incrementCounter,
    reminders, setReminders,
  }

  const onClick = async () => {
    console.log('onClick')
    await km.process('move up').then( async () => {
      debugger
      debugger
    })
  }

  return (
    <div className='App'>
      <div className='Links'>
        <a style={{'margin-left': '30px', 'margin-top': '20px'}} href={'https://youtu.be/KHMlsost7pw'} target="_blank" rel="noreferrer">YouTube Demo of Using This POC Page</a>
        <a style={{'margin-left': '30px', 'margin-top': '20px'}} href={'https://github.com/cooledge/entodicton/blob/master/reminders/src/API.js'} target="_blank" rel="noreferrer">
          Source Code of API for this page
        </a>
      </div>
      <span id={`queryCounter${counter}`} style={{display: 'none'}}>{counter}</span>
      <Text {...props} />
      <Reminders mode="horizontal" reminders={reminders} setMessage={setMessage} openAnimation="slide-up"/>
    </div>
  )
}

export default App;
