import React, { useEffect, useState } from "react";
import './css/menus.css'
import Text from './Text'
import makeAPI from './API'
import RCMenu from './Menu'
const tpmkms = require('tpmkms_4wp')
const menu = require('./Menu.json')

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
]

/*
  call this the cool menu
  show the cool menu

  call this choice fred
  call this choice barney

  make a macro called highlight
    make this italics and bold

  highlight this

  save this file as my cool new file of stuff
  open my cool new file

  create a new menu called greg
  add this to the greg menu
  move this up
  remove this
  call this zapper

  make a top level menu called greg
  put the greg menu after this/here
*/

const App = () => {
  const [openKeys, setOpenKeys] = useState([])
  const [selectedKeys, setSelectedKeys] = useState([])
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
      const km = await tpmkms.menus()
      km.stop_auto_rebuild()
        await km.setApi(() => makeAPI(km))
        // km.kms.ui.api = km.api
        km.config.debug = true
        const url = `${new URL(window.location.href).origin}/entodicton`
        km.config.url = url
        km.server(url)
        
      await km.restart_auto_rebuild()
      for (const subMenu of menu) {
        const menuId = km.api.addMenu(subMenu.key)
        for (const child of subMenu.children) {
          if (child.key) {
            km.api.addMenuItem(menuId, child.key, child.text)
          }
        }
      }
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
    selectedKeys, setSelectedKeys,
    openKeys, setOpenKeys,
  }

  const onClick = async () => {
    console.log('onClick')
    setOpenKeys(['File']) 
    setSelectedKeys(['File-Open']) 
    await km.process('move up').then( async () => {
      debugger
      debugger
    })
  }

  return (
    <div className='App'>
      <div className='Links'>
        <a style={{'margin-left': '30px', 'margin-top': '20px'}} href={'https://youtu.be/5IXwd1j9Cak'} target="_blank" rel="noreferrer">YouTube Demo of Using This POC Page</a>
        <a style={{'margin-left': '30px', 'margin-top': '20px'}} href={'https://github.com/cooledge/entodicton/blob/master/wp/src/API.js'} target="_blank" rel="noreferrer">Source Code of API for this page</a>
      </div>
      <input id='greginput' type='text'/><button id='gregbutton' onClick={onClick}>DOIT</button>
      <span id={`queryCounter${counter}`} style={{display: 'none'}}>{counter}</span>
      <Text {...props} />
      <RCMenu mode="horizontal" selectedKeys={selectedKeys} openKeys={openKeys} setSelectedKeys={setSelectedKeys} setOpenKeys={setOpenKeys} openAnimation="slide-up"/>
    </div>
  )
}

export default App;
