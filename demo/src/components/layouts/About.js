import React, {Link, Component, useState} from 'react';
import { useDispatch } from 'react-redux';
import {connect} from 'react-redux';
import { Form, Button } from 'react-bootstrap'
import overview from '../../assets/overview.pdf'
const VERSION = require('./VERSION')
const _ = require('underscore')


class About extends Component {
  render() {
    const url = "https://github.com/cooledge/entodicton/blob/TAG".replace("TAG", VERSION.version)
    return (
      <div className='about'>
        <div className='line'>
          <span class='label'>Contact:</span> <span class='value'><a href="mailto: dev@thinktelligence.com">email</a></span>
        </div>
        <div className='line'>
          <span class='label'>Version:</span> <span class='value'>{VERSION.version}</span>
        </div>
        <div className='line'>
          <span class='label'>Source for this website:</span> <span class='value'>
            <a href={url.replace("TAG", VERSION.version)} target="_blank">source</a>
          </span>
        </div>
        <div className='line'>
          <span class='label'>Paper:</span> <span class='value'>
            <a href={overview} target="_blank">pdf</a>
          </span>
        </div>
      </div>
    )
  }
}

export default About

