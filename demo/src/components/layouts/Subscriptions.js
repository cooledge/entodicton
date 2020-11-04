import React, {Link, Component, useState} from 'react';
import { useDispatch } from 'react-redux';
import {connect} from 'react-redux';
const base64 = require('base-64');
//import { Subscription } from '../Subscription'
import { setSubscription, setLogs, setCredentials } from '../../actions/actions'
const parameters = require('../parameters')
import { Form, Button } from 'react-bootstrap'
const _ = require('underscore')

//export default function Purchase() {
function Login() {
  const [subscriptionId, setSubscriptionId] = useState('111')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch();

  const handleClick = () => {
    console.log(subscriptionId);
    console.log(password);
    dispatch( new setCredentials(subscriptionId, password) ) 
  };

  return (
        <Form>
          <Form.Group controlId="formLogin">
            <Form.Label>Subscription Id</Form.Label>
            <Form.Control type="text" placeholder="Subscription Id" onChange = { (e) => setSubscriptionId(e.target.value) }/>
          </Form.Group>

          <Form.Group controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password" onChange = { (e) => setPassword(e.target.value) } />
          </Form.Group>
          <Button onClick={ () => handleClick() }>
            Login
          </Button>
        </Form>
  );
}

//const URL = 'http://ec2-18-217-156-104.us-east-2.compute.amazonaws.com:10000/api'
//const URL = process.env.THINKTELLIGENCE_URL || 'http://localhost:10000/api';
const URL = parameters.thinktelligence.server;

const refresh = (dispatch, subscription_id, password) => {
  fetch(`${URL}/subscription`, {
    method: "GET",
    headers: {
      mode: "no-cors", // Type of mode of the request
      "Content-Type": "application/json", // request content type
      "Authorization": 'Basic ' + base64.encode(subscription_id + ":" + password)
    },
    }).then( async (r) => {
      let json = {}
      try {
        json = await r.json()
      } catch(e) {
      }
      dispatch(setSubscription(json))
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

const cancelSubscription = (subscription_id, password) => {
  if (window.confirm("Are you sure?")) {
    fetch(`${URL}/cancel`, {
      method: "POST",
      headers: {
        mode: "no-cors", // Type of mode of the request
        "Content-Type": "application/json", // request content type
        "Authorization": 'Basic ' + base64.encode(subscription_id + ":" + password)
      },
      }).then( result => {
        if (result.status == 200) {
          window.alert("Delete of the deployment is started and the subscription in paypal has been cancelled")
        } else {
          window.alert(`Error processing request ${result.status}. You can keep trying until you get bored or it works or you can got to Paypal and cancel the subcription there.`)
        }
      });
  }
};

const handleLogoutClick = (dispatch) => {
  dispatch( new setCredentials('', '') ) 
};

// Well partner, looks like we've reached the end of our time together. We had our ups and downs but god damnit, I say you are the finest of fellows. I wish happy trails. And if we meet up again in hereafter, that would be fine by me. Delete yes/no
class Subscription extends Component {
  render() {
    const s = this.props.subscription;
    return (
            <div>
              <h2>Subscription</h2>
              { !_.isEmpty(s) &&
                <div>
                  {s.deployed && 
                    <div><button onClick={() => cancelSubscription(s.subscription_id, this.props.password)}>Cancel Subscription</button></div>
                  }
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
              }
              { _.isEmpty(s) &&
                <div>Not found</div>
              }
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
    console.log('this.props', this.props);
    const needCreds = _.isEmpty(this.props.subscription_id) || _.isEmpty(this.props.password);
    if (!needCreds) {
      refresh(this.props.dispatch, this.props.subscription_id, this.props.password);
    }
    return (
      <div className='subscriptions'>
        { needCreds && 
          <Login />
        }
        { !needCreds && 
          <div>
            <div class='buttons'>
              { !_.isEmpty(this.props.subscription) &&
                <Button onClick={() => refresh(this.props.dispatch, this.props.subscription_id, this.props.password)}>Refresh</Button>
              }
              <Button onClick={() => handleLogoutClick(this.props.dispatch)}>Logout</Button>
            </div>
            <Subscription subscription={this.props.subscription} dispatch={this.props.dispatch} password={this.props.password}/>
            { !_.isEmpty(this.props.subscription) &&
              <Logs logs={this.props.logs} />
            }
          </div>
        }
      </div>
    )
  }
}

const mapStateToProps = state => {
    return state.subscription;
}

export default connect(mapStateToProps)(Subscriptions)

