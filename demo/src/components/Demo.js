import React, {Component, useState} from 'react';
import Button from 'react-bootstrap/Button';
const { Config, scorekeeper, crew, reports, hierarchy, properties, kirk, animals, help } = require('tpmkms_4wp')

const kms = [
  scorekeeper,
  reports,
  hierarchy,
  properties,
  kirk,
  animals
].map( (km) => km.add(help) )

const demoKM = scorekeeper.add(reports).add(animals).add(crew);

const Demo = () => {
  const [count, setCount] = useState(0)
  const nextCount = () => {
    const value = count
    setCount(count + 1)
    return value
  }
  const [responses, setResponses] = useState([])
  const [km, setKM] = useState(demoKM)
  const addResponse = (response) => {
    const updated = [...responses]
    updated.push({ response, key: nextCount() })
    setResponses(updated)
  }
  const onClick = async () => {
    try {
      const km = scorekeeper
      const url = `${new URL(window.location.href).origin}/entodicton`
      km.server(url)
      const query = document.getElementById("query").value;
      document.getElementById("query").value = '';
      const response = await km.process(query)
      for (let i = 0; i < response.contexts.length; ++i) {
        if (response.contexts[i].isResponse) {
          addResponse(response.responses[i])
        } else {
          addResponse(response.paraphrases[i])
        }
      }
    } catch( e ) {
      console.log(e)
    }
  }
  const responseItems = [...responses].reverse().map((r) => (<li key={r.key}><pre>{r.response}</pre></li>))
  return (
    <div className='demo'>
      <h1 className='header'>Demo</h1>
      <p>
        Queries can be passed to the selected knowledge modules and the results will be shown. As soon as I get a cert for my site I will update this to use speech recognition.
      </p>
      <div className='kms'>
      </div>
      Request <input id='query' placeholder='some queries are below.' onKeyPress={
        (event) => {
          if (event.key === 'Enter') {
            onClick()
          }
        } }
        type='text' className='request' />
        <Button id='submit' variant='contained' onClick={onClick}>Submit</Button>
        <div className='response'>
          <ul>
            {responseItems}
          </ul>
        </div>
    </div>
  )
}

export default Demo;
