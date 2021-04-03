import React, {Component, useState} from 'react';
const kms = require('./kms.json');

const KM = (km) => {
  const [open, setOpen] = useState(false)
  const examples = km.examples.map( (example) => (<li>{example}</li>) );
  return (
    <span className='km'>
      { open &&
        <span class='arrow down' onClick={ () => setOpen(false)} />
      }
      { !open &&
        <span class='arrow right' onClick={ () => setOpen(true)} />
      }
      <span class='kmName'>{km.name}</span> - <span class='kmDescription'>{km.description}</span>
      <br/>
      {open &&
        <div class='kmUtterances'>
          <h4>Sample utterances</h4>
          <ul>
          {examples}
          </ul>
        </div>
      }
    </span>
  );
}

const KMs = () => {
  const listing = kms.map( (km) => KM(km) )

  return (
    <div className='kms'>
      <h1 className='header'>Knowledge Module</h1>
      <p>
        A knowledge module is a predefined config file that can either be used as-is or by defining how new interface functions. The knowledge modules can be found in the <a href={"https://www.npmjs.com/package/ekms"} target="_blank">EKMS package</a>.
      </p>
      { listing }
    </div>
  )
}

export default KMs;
