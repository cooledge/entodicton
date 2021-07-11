import React, {Link, Component, useState} from 'react';
import { useDispatch } from 'react-redux';
import {connect} from 'react-redux';
const base64 = require('base-64');
//import { Subscription } from '../Subscription'
import { setSubscription, setLogs, setCredentials, setDemoConfig, setAutoShutoffTimeInMinutes } from '../../actions/actions'
const parameters = require('../parameters')
import { Form, Button } from 'react-bootstrap'
const _ = require('underscore')
const fs = require('fs');
const versions = require('../versions')
const VERSION = require('./VERSION')

function DeployVersion({refreshHandler, subscription_id, password}) {
  const [disabled, setDisabled] = useState(false)
 
  const handleDeploy = () => () => {
    setDisabled(true)
    setTimeout( () => { refreshHandler() }, 10000 )
    fetch(`${URL}/update`, {
      method: "POST",
      headers: {
        mode: "no-cors", // Type of mode of the request
        "Content-Type": "application/json", // request content type
        "Authorization": 'Basic ' + base64.encode(subscription_id + ":" + password)
      },
      }).then( result => result.json() )
        .then( json => {
        if (json.error) {
          window.alert(`Error processing the request: ${json.error}.`)
        }
        refreshHandler()
        setDisabled(false)
      });
  };

  return (
      <span className='deployVersion'>
        <Button disabled={disabled} onClick={ handleDeploy() }>Upgrade to current version {VERSION.version}</Button>
        <a href={'https://github.com/thinktelligence/entodicton/blob/main/versions.json'} target="_blank">Version Info</a>
      </span>
  );
}

function VersionSelector({refreshHandler, subscription_id, password}) {
 
  const handleDeploy = (version) => () => {
    fetch(`${URL}/update?version=${version}`, {
      method: "POST",
      headers: {
        mode: "no-cors", // Type of mode of the request
        "Content-Type": "application/json", // request content type
        "Authorization": 'Basic ' + base64.encode(subscription_id + ":" + password)
      },
      }).then( result => result.json() )
        .then( json => {
        if (json.error) {
          window.alert(`Error processing the request: ${json.error}.`)
        }
        refreshHandler()
      });
  };

  let listing = [];
  Object.keys(versions).forEach( (version) => {
    const entry = versions[version]
    listing.push((
      <tr key={version}>
        <td>{version}</td>
        <td>{entry.bugs}</td>
        <td>{entry.features}</td>
        <td>
          <Button onClick={ handleDeploy(version) }>Deploy</Button>
        </td>
      </tr>
    ));
  });

  const [open, setOpen] = useState(false)

  const handleToggle = () => {
    if (open) {
      setOpen(false)
    } else {
      setOpen(true)
    }
  };

  return (
    <div>
      <h2>Version Selector
        <span className={ open ? "caret down" : "caret right" } onClick={ () => handleToggle() }></span>
      </h2>
      { open &&
        <table>
          <thead>
            <tr>
              <th>Version</th><th>Bugs</th><th>Features</th>
            </tr>
          </thead>
          <tbody>
            {listing}
          </tbody>
        </table>
      }
    </div>
  );
}

function SubmitBug({handleClose, refresh, subscription_id, password}) {
  const [description, setDescription] = useState('')
  const [expectedResults, setExpectedResults] = useState('')
  const [expectedGenerated, setExpectedGenerated] = useState('')
  const [config, setConfig] = useState('')

  const handleSubmit = () => {
    const body = { description, expectedResults, expectedGenerated, config };
    fetch(`${URL}/bug`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        mode: "no-cors", // Type of mode of the request
        "Content-Type": "application/json", // request content type
        "Authorization": 'Basic ' + base64.encode(subscription_id + ":" + password)
      },
      }).then( result => {
        if (result.status == 200) {
        } else {
        }
      });
    refresh()
    handleClose()
  };

  return (
        <Form className='submitBug'>
          <Form.Group controlId="formDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control as='textarea' placeholder="description" onChange = { (e) => setDescription(e.target.value) }/>
          </Form.Group>

          <Form.Group controlId="formExpectedResults">
            <Form.Label>Expected Results (in JSON)</Form.Label>
            <Form.Control as="textarea" placeholder="expected results" onChange = { (e) => setExpectedResults(e.target.value) } />
          </Form.Group>

          <Form.Group controlId="formExpectedGenerated">
            <Form.Label>Expected Generated (in JSON)</Form.Label>
            <Form.Control as="textarea" placeholder="expected generated" onChange = { (e) => setExpectedGenerated(e.target.value) } />
          </Form.Group>

          <Form.Group controlId="formConfig">
            <Form.Label>Expected Config (in JSON)</Form.Label>
            <Form.Control as='textarea' placeholder="config file" onChange = { (e) => setConfig(e.target.value) } />
          </Form.Group>

          <Button onClick={ () => handleSubmit() }>Submit</Button>
          <Button onClick={ () => handleClose() }>Cancel</Button>
        </Form>
  );
}

function BugListing({bugs, refresh, subscription_id, password}) {
  const [doingDelete, setDoingDelete] = useState(false)
 
  const handleDelete = (id) => () => {
    setDoingDelete(true);
    fetch(`${URL}/bug?id=${id}`, {
      method: "DELETE",
      headers: {
        mode: "no-cors", // Type of mode of the request
        "Content-Type": "application/json", // request content type
        "Authorization": 'Basic ' + base64.encode(subscription_id + ":" + password)
      },
      }).then( result => {
        refresh()
        setDoingDelete(false);
      });
  };
 
  const listing = bugs.map( (bug) => { return (
      <tr key={bug.id}>
        <td>{bug.id}</td>
        <td>{bug.workflow}</td>
        <td>{bug.found_version}</td>
        <td>{bug.fixed_version}</td>
        <td>{bug.description}</td>
        <td>
          <Button disabled={doingDelete} onClick={ handleDelete(bug.id) }>Delete</Button>
        </td>
      </tr>
    ) } );

  return (
    <div>
      { bugs.length == 0 &&
        <span>No bugs have been submitted for this subscription</span>
      }
      { bugs.length > 0 &&
        <table>
          <thead>
            <tr>
              <th>Id</th><th>Status</th><th>Found Version</th><th>Fixed Version</th><th>Description</th>
            </tr>
          </thead>
          <tbody>
            {listing}
          </tbody>
        </table>
      }
    </div>
  );
}

function Bugs({subscription_id, password}) {
  const [bugs, setBugs] = useState([])
  const [initialized, setInitialized] = useState(false)
  const [doingRefresh, setDoingRefresh] = useState(false)

  const refresh = () => {
    setDoingRefresh(true);
    fetch(`${URL}/bugs`, {
      method: "GET",
      headers: {
        mode: "no-cors", // Type of mode of the request
        "Content-Type": "application/json", // request content type
        "Authorization": 'Basic ' + base64.encode(subscription_id + ":" + password)
      },
      }).then( async (r) => {
        setDoingRefresh(false);
        let json = {}
        try {
          json = await r.json()
        } catch(e) {
        }
        setBugs(json.Items)
      });
  }

  /*
  const handleSubmit = () => {
    const url = `https://github.com/thinktelligence/entodicton/blob/${parameters.version}/bugs/bug.js`
    window.open(url, "_blank")
  }
  */

  if (!initialized) {
    setInitialized(true)
    refresh(setBugs)
  }

  return (
          <div>
            <h2>Bug Submissions</h2>
            <div className='listBugs'>
              <span>
                <Button disabled={doingRefresh} onClick={ () => refresh() }>Refresh</Button>
                <a class='youtubeLink' href={'https://www.youtube.com/watch?v=SRwJrvSVW7U'} target="_blank">How to submit a bug</a>
              </span>
              <BugListing bugs={bugs} refresh={refresh} subscription_id={subscription_id} password={password}/>
            </div>
          </div>
         )
}

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

const URL = parameters.thinktelligence.url;

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
      if (json['DNS'] && json['keys']) {
        dispatch(setDemoConfig(`http://${json['DNS']}`, json['keys'][0]))
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

//const cancelConfirm = "Well partner, looks like we've reached the end of our time together. We had our ups and downs but god damnit, I say you are the finest of fellows. I wish you happy trails. And if we meet up again in the great hereafter, that would be fine by me. Delete yes/no";
const cancelConfirm = "Delete subscription?";

const startServer = (dispatch, subscription_id, password, autoShutoffTimeInMinutes, setControlButtonEnabled) => {
  const refreshHandler = () => refresh(dispatch, subscription_id, password);
  setTimeout( () => { refreshHandler() }, 10000 )
  setControlButtonEnabled(false)
  fetch(`${URL}/start?time=${autoShutoffTimeInMinutes}`, {
    method: "POST",
    headers: {
      mode: "no-cors", // Type of mode of the request
      "Content-Type": "application/json", // request content type
      "Authorization": 'Basic ' + base64.encode(subscription_id + ":" + password)
    },
    }).then( async result => {
      setControlButtonEnabled(true)
      if (result.status == 200) {
        const json = await result.json();
        if (json.status == 200) {
          refreshHandler();
        } else {
          window.alert(`Error processing the stop request. ${json.statusText}`)
        }
      } else {
        window.alert(`Error processing the stop request. Error code ${result.status}`)
      }
    });
}

const stopServer = (dispatch, subscription_id, password, setControlButtonEnabled) => {
  const refreshHandler = () => refresh(dispatch, subscription_id, password);
  setTimeout( () => { refreshHandler() }, 10000 )
  setControlButtonEnabled(false)
  fetch(`${URL}/stop`, {
    method: "POST",
    headers: {
      mode: "no-cors", // Type of mode of the request
      "Content-Type": "application/json", // request content type
      "Authorization": 'Basic ' + base64.encode(subscription_id + ":" + password)
    },
    }).then( async result => {
      setControlButtonEnabled(true)
      if (result.status == 200) {
        const json = await result.json();
        if (json.status == 200) {
          refreshHandler();
        } else {
          window.alert(`Error processing the stop request. ${json.statusText}`)
        }
      } else {
        window.alert(`Error processing the stop request. Error code is ${result.status}`)
      }
    });
}

const cancelSubscription = (subscription_id, password) => {
  if (window.confirm(cancelConfirm)) {
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

function Subscription({subscription, autoShutoffTimeInMinutes, dispatch, password}) {
  const [controlButtonEnabled, setControlButtonEnabled] = useState(true)
  const s = subscription;
  return (
          <div>
            <h2>Subscription</h2>
            { !_.isEmpty(s) &&
              <div>
                  {s.deployed && 
                    <div><button onClick={() => cancelSubscription(s.subscription_id, password)}>Cancel Subscription</button></div>
                  }
                  { !s.always_on && s.deployed &&
                    <div className='controlServer'>
                      {s.is_running && 
                        <div><button disabled={!controlButtonEnabled} onClick={() => stopServer(dispatch, s.subscription_id, password, setControlButtonEnabled)}>Stop Server</button></div>
                      }
                      {s.is_running &&
                        <div className='line'><span className='label'>Start time UTC:</span><span className='value'>{`${s.start_time}`}</span></div>
                      }
                      {s.is_running &&
                        <div className='line'><span className='label'>Auto shutoff time:</span><span className='value'>{`${s.up_time_in_seconds/60} minutes`}</span></div>
                      }
                      {!s.is_running &&
                          <button disabled={!controlButtonEnabled} onClick={() => startServer(dispatch, s.subscription_id, password, autoShutoffTimeInMinutes, setControlButtonEnabled)}>Start Server</button>
                      }
                      {!s.is_running &&
                        <Form.Group controlId="formAutoShutoff">
                          <Form.Label>Auto-shutoff after time in minutes</Form.Label>
                          <Form.Control type="text" defaultValue={autoShutoffTimeInMinutes} placeholder="time in minutes" onChange = { (e) => dispatch(setAutoShutoffTimeInMinutes(e.target.value)) }/>
                        </Form.Group>
                      }
                      <div className='line'><span className='label'>Minutes available:</span><span className='value'>{s.subscription_time_in_seconds/60}</span></div>
                      <div className='line'><span className='label'>Next billing time UTC:</span><span className='value'>{s.next_billing_time}</span></div>
                    </div>
                  }
                <div className='line'><span className='label'>Subscription Id:</span><span className='value'>{s.subscription_id}</span></div>
                <div className='line'><span className='label'>Deployed:</span><span className='value'>{s.deployed ? "True" : "False"}</span>
                  {s.deployed &&
                    <span>Demo page is pointing at this deployment</span>
                  }
                </div>
                <div className='line'><span className='label'>Key:</span><span className='value'>{s.keys}</span></div>
                <div className='line'><span className='label'>Server Name</span><span className='value'>{s.DNS}</span></div>
                <div className='line'><span className='label'>Stack name:</span><span className='value'>{s.stack_name}</span></div>
                <div className='line'><span className='label'>Number of instances:</span><span className='value'>{s.NUMBER_OF_INSTANCES}</span></div>
                <div className='line'><span className='label'>Paypal Plan Id:</span><span className='value'>{s.plan_id}</span></div>
                <div className='line'><span className='label'>Entodicton Version:</span><span className='value'>{s.VERSION}</span></div>
              </div>
            }
            { _.isEmpty(s) &&
              <div>Loading</div>
            }
          </div>
         )
}

class Logs extends Component {
  render() {
    let logs = this.props.logs;
    if (logs.error) {
      logs = ""
    }

    return (
            <div>
              <h2>Logs</h2>
              <pre>{logs}</pre>
            </div>
           )
  }
}

class Subscriptions extends Component {
  render(){
    console.log('this.props', this.props);
    const needCreds = _.isEmpty(this.props.subscription_id) || _.isEmpty(this.props.password);
    const refreshHandler = () => refresh(this.props.dispatch, this.props.subscription_id, this.props.password);
    if (!needCreds) {
      refreshHandler()
    }
    return (
      <div className='subscriptions'>
        { needCreds && 
          <Login />
        }
        { !needCreds && 
          <div>
            <div className='buttons'>
              { !_.isEmpty(this.props.subscription) &&
                <Button onClick={() => refreshHandler()}>Refresh</Button>
              }
              <Button onClick={() => handleLogoutClick(this.props.dispatch)}>Logout</Button>
            </div>
            <Subscription refresh={refreshHandler} subscription={this.props.subscription} dispatch={this.props.dispatch} password={this.props.password} autoShutoffTimeInMinutes={this.props.autoShutoffTimeInMinutes} />
            { this.props.subscription['upgradable'] &&
              <DeployVersion refreshHandler={refreshHandler} subscription_id={this.props.subscription_id} password={this.props.password} />
            }
            { !_.isEmpty(this.props.subscription) &&
              <Logs logs={this.props.logs} />
            }
            <Bugs subscription_id={this.props.subscription_id} password={this.props.password} />
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

