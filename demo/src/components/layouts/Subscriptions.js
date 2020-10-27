import React, {Link, Component, Button} from 'react';
import {connect} from 'react-redux';
const base64 = require('base-64');
//import { Subscription } from '../Subscription'
import { setSubscription, setLogs, setCredentials } from '../../actions/actions'

const URL = 'http://localhost:10000/api'

const refresh = (dispatch, subscription_id, password) => {
  fetch(`${URL}/subscription`, {
    method: "GET",
    headers: {
      mode: "no-cors", // Type of mode of the request
      "Content-Type": "application/json", // request content type
      "Authorization": 'Basic ' + base64.encode(subscription_id + ":" + password)
    },
    }).then( async (r) => {
      dispatch(setSubscription(await r.json()))
    });

  fetch(`${URL}/logs`, {
    method: "GET",
    headers: {
      mode: "no-cors", // Type of mode of the request
      "Content-Type": "application/json", // request content type
      "Authorization": 'Basic ' + base64.encode(subscription_id + ":" + password)
    },
    }).then( async (r) => {
      dispatch(setLogs(await r.text()))
    });
};

// Well partner, looks like we've reached the end of our time together. We had our ups and downs but god damnit, I say you are the finest of fellows. I wish happy trails. And if we meet up again in hereafter, that would be fine by me. Delete yes/no
class Subscription extends Component {
  render() {
    const s = this.props.subscription;
    return (
            <div>
              <h2>Subscription</h2>CancelSubscriptionButton
              <div className='line'><span className='label'>Subscription Id:</span><span className='value'>{s.subscription_id}</span></div>
              <div className='line'><span className='label'>Deployed:</span><span className='value'>{s.deployed ? "True" : "False"}</span></div>
              <div className='line'><span className='label'>Keys:</span><span className='value'>{s.keys}</span></div>
              <div className='line'><span className='label'>DNS:</span><span className='value'>{s.DNS}</span></div>
              <div className='line'><span className='label'>AMI id:</span><span className='value'>{s.ami_id}</span></div>
              <div className='line'><span className='label'>Stack name:</span><span className='value'>{s.stack_name}</span></div>
              <div className='line'><span className='label'>Number of instances:</span><span className='value'>{s.NUMBER_OF_INSTANCES}</span></div>
              <div className='line'><span className='label'>Paypal Plan Id:</span><span className='value'>{s.plan_id}</span></div>
              <div className='line'><span className='label'>Entodicton Version:</span><span className='value'>{s.VERSION}</span></div>
            </div>
           )
  }
}

class Logs extends Component {
  render() {
    const s = this.props.logs;
    return (
            <div>
              <h2>Logs</h2>
              <pre>{this.props.logs}</pre>
            </div>
           )
  }
}

class Subscriptions extends Component {
  render(){
    console.log(this.props);
    refresh(this.props.dispatch, this.props.subscription_id, this.props.password);
    return (
      <div className='subscriptions'>
        <Subscription subscription={this.props.subscription} />
        <Logs logs={this.props.logs} />
      </div>
    )
  }
}

const mapStateToProps = state => {
    return state.subscription;
}

export default connect(mapStateToProps)(Subscriptions)

