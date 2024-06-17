import React, {Link, Component, useState} from 'react';
import { useDispatch } from 'react-redux';
import {connect} from 'react-redux';
import { Form, Button } from 'react-bootstrap'
const VERSION = require('./VERSION')
const _ = require('underscore')

class About extends Component {
  render(){
    return (
      <div className='about'>
        <div className='line'>
          <span class='label'>Contact:</span> <span class='value'><a href="mailto: dev@thinktelligence.com">email</a></span>
        </div>
        <div className='line'>
          <span class='label'>Version:</span> <span class='value'>{VERSION.version}</span>
        </div>
      </div>
    )
  }
}

export default About

