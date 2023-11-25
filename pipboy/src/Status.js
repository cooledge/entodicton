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

function Status({ health }) {
  // const [current, setCurrent] = useState(0);
console.log('Status - health', health)
  const width = (value) => {
    return 40 * (value / 100)
  }
  const bar = (value) => {
    return (
              <div className="stat-bar">
                <div className="level-progress">
                  <div className="level-progress-indicator" style={ { 'width': width(value) } }></div>
                </div>
              </div>
    )
  }
  return (
            <div className="tab-content">
              <div className="tab-pane active" id="status" role="tabpanel">
                  <div className="center-image">
                    <img src={_2344} alt="" />
                  </div>
                  <div className="stat-bars">   
                  <div className="row">
                    <div className="col-12">
                      { bar( health.head ) }
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-3">
                      { bar( health.arm.right ) }
                    </div>

                    <div className="col-6">
                    </div>

                    <div className="col-3">
                      { bar( health.arm.left ) }
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-3">
                      { bar( health.leg.right ) }
                    </div>
                    <div className="col-6">
                    </div>
                    <div className="col-3">
                      { bar( health.leg.left ) }
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12">
                      { bar( health.torso ) }
                    </div>
                  </div>
                  <div className="row stat-numbers">
                    <div className="spacer-numbers"></div>
                      <div className="col-2">
                        <img src={_333} className="img-responsive" />
                      </div>
                      <div className="col-1">
                        <div className="icon">
                          <img src={_33} className="sm-image img-responsive"/>
                        </div>
                        { /* gun damage */ }
                        <div className="points">10</div>
                      </div>
                      <div className="col-1 transparent">
                      </div>
                      <div className="col-2">
                        <img src={helmet} alt=""/>
                      </div>
                      <div className="col-1">
                        <div className="icon">
                          <img src={energy} className="en-image img-responsive" />
                        </div>
                        { /* electricity resistance from armor */ }
                      <div className="points">10</div>
                    </div>
                    <div className="col-1">
                      <div className="icon">
                        <img src={radiation} className="rad-image img-responsive" />
                        { /* radiation resistance from armor */ }
                      </div>
                      <div className="points">18</div>
                    </div>
                    <div className="col-2 transparent"></div>
                  </div>
                </div>
              </div>
            </div>
  );
}

export default Status;
