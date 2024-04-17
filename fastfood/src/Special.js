import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import './css/tether.min.css';
import './css/bootstrap.min.css';
import './css/fastfood.css';
import 'bootstrap/dist/css/bootstrap.css'
import Inv from './Inv'
import SpecialList from './SpecialList'
import ItemDesc from './ItemDesc'

function Status(props) {
  return (
          <div className="tab-content">
            <div className="tab-pane active full" id="status" role="tabpanel">
              <SpecialList {...props} />
              <ItemDesc {...props}>
                {props.special.find((s) => s.id == props.specialId).description}
              </ItemDesc>
            </div>
          </div>
  );
}

export default Status;
