import React, {Component, useState} from 'react';
const kms = require('./KMs.json');

const KM = (km) => {
  const [open, setOpen] = useState(false)
  const examples = km.examples.map( (example) => (<li>{example}</li>) );
  const includes = (km.includes || []).join(',');
  return (
    <span className='km'>
      { open &&
        <span class='arrow down' onClick={ () => setOpen(false)} />
      }
      { !open &&
        <span class='arrow right' onClick={ () => setOpen(true)} />
      }
      <span class='kmName'>{km.name}</span> - <span class='kmDescription'>{km.description}</span>
      <a href={km.source} target="_blank">(source)</a>
      <br/>
      {open && km.includes && km.includes.length > 0 &&
        <div class='kmUtterances'>
          <br/>
          <span><b>Includes:</b></span>
          <span>
          {includes}
          </span>
        </div>
      }
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
      <h1 className='header'>Knowledge Modules</h1>
      <p>
        A knowledge module is a predefined config file that can either be used as-is or by defining how new api functions. The knowledge modules can be found in the <a href={"https://www.npmjs.com/package/ekms"} target="_blank">EKMS package</a>. 
        <a href={"https://youtu.be/4QDPLGjlq3g"} target="_blank">Demo of using knowledge modules from the EKMS package</a> 
        <br/>
        Here is a list of existing KM's.
      </p>
      { listing }
    </div>
  )
}

export default KMs;
