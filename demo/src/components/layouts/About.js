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
        <p>
        The product model is to be low touch with high volume. I am looking for people who develop solutions to integrate this service. For example, you could develop a solution using Entodicton and instead of having the customer site directly call the service it could call your proxy to my service. Then the customer does not know you are using my service and I do not know who you customers are. You can then charge the customer what you want for your service.
        </p>
      </div>
    )
  }
}

export default About

