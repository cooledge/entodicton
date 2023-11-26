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
import PerkList from './PerkList'

function Perks(props) {
  return (
            <div className="tab-content">
              <div className="tab-pane active" id="status" role="tabpanel">
                <PerkList {...props} />
              </div>
            </div>
  );
}

export default Perks;
