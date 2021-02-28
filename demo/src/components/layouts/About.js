import React, {Link, Component, useState} from 'react';
import { useDispatch } from 'react-redux';
import {connect} from 'react-redux';
import { Form, Button } from 'react-bootstrap'
const _ = require('underscore')

class About extends Component {
  render(){
    return (
      <div className='about'>
        Contact Support: <a href="mailto: support@thinktelligence.com">email</a>
      </div>
    )
  }
}

export default About

