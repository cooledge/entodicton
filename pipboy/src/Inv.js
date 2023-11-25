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
import parameters from './parameters'
import Weapons from './Weapons'
const { stgame, animals, kirk, scorekeeper, reports, help, properties, hierarchy, Config } = require('tpmkms_4wp')

function Inv(props) {
  const {weapon, setWeapon, activeInvTab, setActiveInvTab, weapons} = props;
  const navLink = (name) => {
    const role = name.toLowerCase() == activeInvTab.toLowerCase() ? "tab" : ""
    return (
      <li className="nav-item">
          <a className="nav-link" data-toggle="tab" role={role} onClick={() => setActiveInvTab(name)}>{name.toUpperCase()}</a>
      </li>
    )
  }

  const weaponsList = weapons.map((weapon) => {
    return (<li><a onMouseEnter={ () => setWeapon(weapon.id) } className={weapon.name}>{weapon.name}</a></li>)
  })

  return (
    <div className="Inv">
      <div className="container">
        <div className="row">
          <div className="col-12">  
            <ul className="nav nav-tabs">
              { navLink('weapons') }
              { navLink('armour') }
              { navLink('aid') }
            </ul>
            { activeInvTab == 'weapons' && <Weapons {...props} /> }
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inv;
