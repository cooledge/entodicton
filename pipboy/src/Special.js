import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import './css/tether.min.css';
import './css/bootstrap.min.css';
import './css/pipboy.css';
import _2344 from './images/2344.png'
import _333 from './images/333.png'
import helmet from './images/helmet.png'
import _33 from './images/33.ico'
import radiation from './images/radiation.png'
import energy from './images/energy.png'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import 'bootstrap/dist/css/bootstrap.css'
import SRDemo from './srdemo';
import Inv from './Inv'
import parameters from './parameters'
const { stgame, animals, kirk, scorekeeper, reports, help, properties, hierarchy, Config } = require('tpmkms_4wp')

function Status() {
  const attributes = ['Strength', 'Perception', 'Endurence', 'Charisma', 'Intelligence', 'Agility', 'Luck'];
  const list = attributes.map( attribute => <li>{attribute}</li> )
  return (
            <div className="tab-content">
              <div className="tab-pane active" id="status" role="tabpanel">
                <ul> 
                  { list }
                </ul>
              </div>
            </div>
  );
}

export default Status;