import React, { useState } from 'react';
import './App.css';
import './css/tether.min.css';
import './css/bootstrap.min.css';
import './css/pipboy.css';
import 'bootstrap/dist/css/bootstrap.css'

function WeaponStat({weapon, weapons}) {
  const data = weapons.find( (w) => w.id == weapon )

  return (
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
  );
}

export default WeaponStat;
