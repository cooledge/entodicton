import React, { useRef, useEffect, useState } from "react";
import './css/drone.css'
import Text from './Text'
import makeAPI from './API'
import SpriteGrid from './SpriteGrid';
const packageJson = require('../package.json');
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
  const [response, setResponse] = useState('');
  const [km, setKM] = useState()

  const incrementCounter = () => {
    setCounter(counter+1)
  }

  const spriteRef = useRef(null);

  useEffect( () => {
    const init = async () => {
      const km = await tpmkms.drone()
      km.stop_auto_rebuild()

        await km.setApi(() => {
          const api = makeAPI(km)()
          api.setSayHandler(setResponse)
          return api
        })
        // km.kms.ui.api = km.api
        km.config.debug = true

        const url = `${new URL(window.location.href).origin}/entodicton`
        km.config.url = url
        km.server(url)
        
      await km.restart_auto_rebuild()

      {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const unittest = urlParams.get('unittest');
        if (unittest) {
          km.api.setSpeed(5)
        }
      }

      setKM(km)

      km.addSemantic({
        match: ({context}) => context.marker == 'controlEnd',
        apply: async ({context, toArray, recall, _continue}) => {
          const paths = await recall({ 
                context: { marker: 'path' }, 
                all: true,
                condition: (context) => context.points,
          })
          if (paths) {
            const sprite = spriteRef.current;
            for (const path of toArray(paths)) {
              if (!path.inUI) {
                if (!path.namespaced?.nameable?.names) {
                  debugger
                }
                const names = path.namespaced.nameable.names
                const points = path.points.map((point) => point.point)
                debugger
                sprite.addPath(names[0], points)
                path.inUI = true
              }
            }
          }
          _continue()
        }
      })
    }

    if (!km) {
      init()
    }
  }, [km, setCounter, spriteRef])


  /*
    useEffect(() => {
      const sprite = spriteRef.current;
      if (!sprite) return;

      // Example: Add some points
      sprite.addPoint("Start", 2, 2);
      sprite.addPoint("Goal", 8, 8);

      // Rotate 45 degrees and move forward at 4 m/s
      sprite.rotate(Math.PI / 4);
      sprite.forward(4);

      // Stop after 3 seconds
      setTimeout(() => {
        sprite.stop();
      }, 3000);
    }, []);
  */

  const props = {
    lastQuery, setLastQuery,
    message, setMessage,
    km,
    incrementCounter,
    spriteRef,
    response, setResponse,
  }

  return (
    <div className='App'>
      <div className='Links'>
        <a style={{'marginLeft': '30px', 'marginTop': '20px'}} href={'https://youtu.be/KHMlsost7pw'} target="_blank" rel="noreferrer">YouTube Demo of Using This POC Page</a>
        <a style={{'marginLeft': '30px', 'marginTop': '20px'}} href={`https://github.com/thinktelligence/theprogrammablemind/blob/${packageJson.version}/kms/common/drone.js`} target="_blank" rel="noreferrer">Source Code of Language config</a>
        <a style={{'marginLeft': '30px', 'marginTop': '20px'}} href={`https://github.com/cooledge/entodicton/blob/${packageJson.version}/drone/src/API.js`} target="_blank" rel="noreferrer">Source Code of API for this page</a>
      </div>
      <span id={`queryCounter${counter}`} style={{display: 'none'}}>{counter}</span>
      <Text {...props} />
      <h2>Sprite Grid Controller</h2>
      <SpriteGrid ref={spriteRef} />
    </div>
  )
}

export default App;
