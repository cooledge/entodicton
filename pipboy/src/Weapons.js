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
import weapons from './weapons.json'

function Weapons({weapon, setWeapon}) {
  const data = weapons.find( (w) => w.id == weapon )

  const weaponsList = weapons.map((weapon) => {
    return (<li><a onMouseEnter={ () => setWeapon(weapon.id) } className={weapon.name}>{weapon.name}</a></li>)
  })
  return (
            <div className="tab-content">
              <div className="tab-pane active full" id="status" role="tabpane">
                <ul className="item-list">
                  {weaponsList}
                </ul>
                <div className="item-stats">
                  <div className="row-highlight">
                    <div className="row"> 
                      <div className="col-12"> 
                        <span className="damage pull-right">{data.damage}</span>
                        <div className="pull-left">Damage</div>
                      </div>
                    </div>
                  </div>

                  <div className="row-highlight">
                    <div className="row"> 
                      <div className="col-12"> 
                        <span className="fire_rate pull-right">{data.fire_rate}</span>
                        <div className="pull-left">Fire Rate</div>
                      </div>
                    </div>
                  </div>

                  <div className="row-highlight">
                    <div className="row"> 
                      <div className="col-12"> 
                        <span className="range pull-right">{data.range}</span>
                        <div className="pull-left">Range</div>
                      </div>
                    </div>
                  </div>

                  <div className="row-highlight">
                    <div className="row"> 
                      <div className="col-12"> 
                        <span className="accuracy pull-right">{data.accuracy}</span>
                        <div className="pull-left">Accuracy</div>
                      </div>
                    </div>
                  </div>

                  <div className="row-highlight">
                    <div className="row"> 
                      <div className="col-12"> 
                        <span className="weight pull-right">{data.weight}</span>
                        <div className="pull-left">Weight</div>
                      </div>
                    </div>
                  </div>

                  <div className="row-highlight">
                    <div className="row"> 
                      <div className="col-12"> 
                        <span className="value pull-right">{data.value}</span>
                        <div className="pull-left">Value</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  );
}

export default Weapons;
