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

function Stat() {
  // const [current, setCurrent] = useState(0);

  return (
    <div className="Stat">
      <div className="container">
        <div className="row">
          <div className="col-12">  
            <ul className="nav nav-tabs">

              <li className="nav-item">
                  <a href="#status" className="nav-link" data-toggle="tab" role="tab">STATUS</a>                         
              </li>

              <li className="nav-item">
                  <a href="#special" className="nav-link" data-toggle="tab">SPECIAL</a>                       
              </li>

              <li className="nav-item">
                  <a href="#perks" className="nav-link" data-toggle="tab">PERKS</a>                    
              </li>

            </ul>

            <div className="tab-content">
              <div className="tab-pane active" id="status" role="tabpanel">
                  <div className="center-image">
                    <img src={_2344} alt="" />
                  </div>
                  <div className="stat-bars">   
                  <div className="row">
                    <div className="col-12">
                      <div className="stat-bar">
                        <div className="level-progress">
                          <div className="level-progress-indicator w-25"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-3">
                      <div className="stat-bar">
                        <div className="level-progress">
                          <div className="level-progress-indicator w-50"></div>
                        </div>
                      </div>
                    </div>

                    <div className="col-6">
                    </div>

                    <div className="col-3">
                      <div className="stat-bar">
                        <div className="level-progress">
                          <div className="level-progress-indicator w30"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-3">
                      <div className="stat-bar">
                        <div className="level-progress">
                          <div className="level-progress-indicator w60"></div>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                    </div>
                    <div className="col-3">
                      <div className="stat-bar">
                        <div className="level-progress">
                          <div className="level-progress-indicator w80"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12">
                      <div className="stat-bar">
                        <div className="level-progress">
                          <div className="level-progress-indicator"></div>
                        </div>
                      </div>
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
                      <div className="points">10</div>
                    </div>
                    <div className="col-1">
                      <div className="icon">
                        <img src={radiation} className="rad-image img-responsive" />
                      </div>
                      <div className="points">18</div>
                    </div>
                    <div className="col-2 transparent"></div>
                  </div>
                  <div className="tab-pane" id="special" role="tabpanel">
                    SPECIAL2
                  </div>
                  <div className="tab-pane " id="perks" role="tabpanel">
                    PERKS
                  </div> -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stat;
