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
import WeaponStat from './WeaponStat'

function Weapons(props) {
  const {weapon, setWeapon, weapons} = props

  const weaponsList = weapons.map((weapon) => {
    return (<li><a onMouseEnter={ () => setWeapon(weapon.id) } className={weapon.name}>{weapon.name}</a></li>)
  })

  return (
            <div className="tab-content">
              <div className="tab-pane active full" id="status" role="tabpane">
                <ul className="item-list">
                  {weaponsList}
                </ul>
                <WeaponStat {...props}/>
              </div>
            </div>
  );
}

export default Weapons;
