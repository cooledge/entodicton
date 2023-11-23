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
import Status from './Status'
import Special from './Special'
import parameters from './parameters'
const { stgame, animals, kirk, scorekeeper, reports, help, properties, hierarchy, Config } = require('tpmkms_4wp')

/*

  return (
    <div className="Header">
      <Nav className="navbar navbar-expand-lg navbar-light">
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav ">
            { navLink("stat", "index.html") }
            { navLink("inv", "inv.html") }
            { navLink("data", "#") }
            { navLink("map", "#") }
            { navLink("radio", "#") }
          </ul>

*/

function Stat({ activeStat, setActiveStat }) {
  const navLink = (name) => {
    const role = name.toLowerCase() == activeStat.toLowerCase() ? "tab" : ""
    return (
      <li className="nav-item">
          <a className="nav-link" data-toggle="tab" role={role} onClick={() => setActiveStat(name)}>{name.toUpperCase()}</a>                         
      </li>
    )
  }

  // const [current, setCurrent] = useState(0);
console.log('activeStat ------------', activeStat)
  return (
    <div className="Stat">
      <div className="container">
        <div className="row">
          <div className="col-12">  
            <ul className="nav nav-tabs">
              { navLink('status') }
              { navLink('special') }
              { navLink('perks') }
            </ul>
            { activeStat == 'status' && <Status/> }
            { activeStat == 'special' && <Special/> }
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stat;
