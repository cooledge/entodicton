import React, {Component, useState} from 'react';
const kms = require('./KMs.json');
const VERSION = require('./VERSION')

const sections = kms.sections
const generalSection = sections.find( (section) => section.name == 'General' )

for (const km of kms.modules) {
  let found = false
  for (const section of sections) {
    if (section.includes.includes(km.name)) {
      found = true
      break
    }
  }
  if (!found) {
    generalSection.includes.push(km.name)
  }
}

const SECTION = (section) => {
  return (
    <div className='section'>
      {section.name}
    </div>
  );
}

const KM = (km) => {
  const [open, setOpen] = useState(false)
  const template = km.template.map( (template) => (<li>{template}</li>) );
  const examples = km.examples.map( (example) => (<li>{example}</li>) );
  const includes = (km.includes || []).join(',');
  // https://github.com/thinktelligence/entodicton/blob/TAG/tutorial/command_line_demo_1.js
  return (
    <span className='km'>
      { open &&
        <span class='arrow down' onClick={ () => setOpen(false)} />
      }
      { !open &&
        <span class='arrow right' onClick={ () => setOpen(true)} />
      }
      <span class='kmName'>{km.name}</span> - <span class='kmDescription'>{km.description}</span>
      <a href={km.source.replace("TAG", VERSION.version)} target="_blank">(source)</a>
      { km.demo &&
        <a href={km.demo} target="_blank">(demo)</a>
      }
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
      {open && template.length > 0 &&
        <div class='kmUtterances'>
          <h4>Initial Knowledge</h4>
          <ul>
          {template}
          </ul>
        </div>
      }
    </span>
  );
}


const KMs = () => {
  const listing = []
  for (const section of sections) {
    if (section.name == 'Hidden') {
      continue
    }
    listing.push(SECTION(section))
    for (const km of kms.modules) {
      if (section.includes.includes(km.name)) {
        listing.push(KM(km))
      }
    }
  }

  return (
    <div className='kms'>
      <h1 className='header'>Knowledge Modules</h1>
      <p>
        A knowledge module is a predefined config file that can either be used as-is or by defining new api functions. The knowledge modules can be found in the <a href={"https://www.npmjs.com/package/tpmkms"} target="_blank">TPMKMS package</a>. 
        <a href={"https://youtu.be/4QDPLGjlq3g"} target="_blank"> Demo of using knowledge modules from the TPMKMS package</a> 
        <br/>
        Here is a list of existing KM's.
      </p>
      { listing }
    </div>
  )
}

export default KMs;
