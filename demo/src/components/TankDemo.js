import React, {Component, useState} from 'react';
import {connect} from 'react-redux';
import tank from '../tank.jpeg';
import building from '../building.png';
import Button from 'react-bootstrap/Button';
//import PropTypes from 'prop-types'
//import client from 'entodicton/client'
const client = require('entodicton/client')
import Config from 'entodicton/src/config'
import { alias, stopTank, setCredentials, placeOrder, moveTank, tick, createAction, destroy, showProperty, setPosition, clearResponse, setResponses, startedQuery, showTrainingTimeWarning } from '../actions/actions'
import store from '../stores/store';
const parameters = require('./parameters')
//import config from './config';
import config_base from './config_base';
import config_earn from './config_earn';
import config_food from './config_food';
import Includes from './Includes';
const uuidGen = require('uuid/v1')

const timersOn = true;
const offsetForPosition_x = 20;
const offsetForPosition_y = 240;

function SlownessWarning() {
  const [visible, setVisible] = useState(false)
  setTimeout( () => { setVisible(true) }, 10000 )
  return ( 
           <span>
             { visible && 
               <span>The neural nets are being trained or the server has a lot of users. All sentences in the demo take less that 6 seconds. Average time is 1 second</span>
             }
           </span>
         )
}

class FoodOrder extends Component {
  render() {
    return (
      <div>
        {this.props.quantity} of {this.props.item} for {this.props.who} from {this.props.from}
      </div>
    );
  }
}

class Sprite extends Component {
  render() {
    return (
      <div
          style={{
            position: 'absolute',
            left: `${this.props.left+offsetForPosition_x}px`,
            top: `${this.props.top+offsetForPosition_y}px`,
            'zIndex': this.z_index
          }} >
        <img 
          src={this.image} 
          className={this.className}
          alt={this.className} />
        {this.props.name}
      </div>
    );
  }
}

class Tank extends Sprite {
  constructor(props) {
    super(props);
    this.image = tank;
    this.className = "Tank";
  }
}

class Building extends Sprite {
  constructor(props) {
    super(props);
    this.image = building;
    this.className = "Building";
  }
}

class Help extends Component {
  render() {
    let utterances = [].concat(config_base.utterances);
    const includes = this.props.includes;
    if (includes.includes('earn')) {
      utterances = utterances.concat(config_earn.utterances)
    }
    if (includes.includes('food')) {
      utterances = utterances.concat(config_food.utterances)
    }
    const items = utterances.map((item) => <li>{item}</li>);
    return ( 
      <div className='help'>
        <h2>Sample Input</h2>
        <ul>
          {items}
        </ul>
      </div> 
    )
  }
}

class FoodOrders extends Component {
  render() {
    let items = this.props.orders.map( (order) => {
      return (<FoodOrder who={order.who} item={order.item} quantity={order.quantity} from={order.from}/>);
    });
    return ( 
      <div className='foodOrders'>
        <h2>Food Orders</h2>
        <ul>
          {items}
        </ul>
      </div> 
    )
  }
}

class Completed extends Component {
  render() {
    let items = this.props.completed.map( (completed) => {
      const key = completed[0];
      const name = completed[1].description;
      return (<li key={key}>{name}</li>)
    })
    return ( 
      <div className='completed'>
        <h2>Completed</h2>
        <ul>
          {items}
        </ul>
      </div> 
    )
  }
}

class World extends Component {
  componentDidMount() {
    if (timersOn) {
      this.interval = setInterval( () => store.dispatch(tick()), 1000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  onClick = (onClick) => (event) => {
    const x = event.clientX - event.currentTarget.offsetLeft;
    const y = event.clientY - event.currentTarget.offsetTop;
    onClick(x, y)
  }

  render() {
    let tanks = this.props.tanks.map( (tank) => {
      return (<Tank key={tank.id} name={this.props.getName(tank.id)} left={tank.left} top={tank.top}/>);
    });
    let buildings = this.props.buildings.map( (building) => {
      return (<Building key={building.id} name={this.props.getName(building.id)} left={building.left} top={building.top}/>);
    });

    let wantsPosition = this.props.responses.find( (response) => response.wantsPosition );
    let className='world'
    if (wantsPosition) {
      className += ' blink'
    }
    return ( 
      <div className={className} onClick={ this.onClick(this.props.onClick) }>
        {tanks}
        {buildings}
      </div> 
    )
  }
}

class QueryPane extends Component {

  static propTypes = {
    //addAlias: PropsTypes.func
  };

  processResponse( objects, addAlias, stopTank, placeOrder, moveTank, create, destroy, showProperty, response, generated ) {
  // master: processResponse( addAlias, stopTank, placeOrder, moveTank, create, destroy, showProperty, response, generated ) {
    console.log('in process response xxzzzzzzzzzzzzzzzzzzzzzz');
    console.log(response);
    let action = () => {};
    let wantsPosition = false;
    if (response.marker === 'wantMcDonalds' || response.marker == 'wantWhitespot') {
      action = () => {
        console.log("IN the place ORDER");
        const from = response.marker;
        const name = response.items.name;
        const quantity = response.items.number || 1;
        const who = 'i';
        placeOrder(name, quantity, who, from);
      }
    } else if (response.action === 'move') {
      let tank = response.thing.id;
      if (response.thing.number == 'all') {
        tank = response.thing;
      }
      const destination = response.place.id;
      action = () => moveTank(tank, destination);
    } else if (response.isProperty === true || response.marker == 'equal') {
      window.alert(generated, 'Answer');
    } else if (response.marker === 'equalProperty') {
      var isQuery = false;
      var property;
      response.objects.forEach( (object) => {
         if (object.isQuery) {
           isQuery = true;
         } 
         if (object.marker == 'property') {
           property = object;
         }
      });
      if (isQuery) {
        console.log(response.generated);
        var oname = property.object.id;
        var pname = property.value.name;
        console.log(`query for ${pname} of ${oname}`);
        action = () => showProperty(oname, pname);
      }
    } else if (response.marker === 'alias') {
      const id = response.thing.id;
      const newName = response.name.marker;
      action = () => addAlias(id, newName);
    } else if (response.marker === 'stop') {
      let name = response.thing.id;
      if (response.thing.number == 'all') {
        name = response.thing;
      }
      action = () => stopTank(name);
    } else if (response.marker === 'create') {
      const klass = response.klass.marker;
      let count = response.klass.number || 1;
      wantsPosition = true;
      let ids = []
      let namess = []
      let currentCount = 23;
      for (let i = 0; i < count; ++i) {
        ids.push(objects.generated_ids.shift())
        namess.push(objects.generated_names.shift())
      }
      action = (x, y) => create(klass, count, ids, namess, x, y);
    } else if (response.marker === 'destroy') {
      let id = response.name.id;
      if (response.name.number == 'all') {
        id = response.name;
      }
      action = () => destroy(id);
    }

    //const description = `${generated} / ${JSON.stringify(response)}`;
    const description = `${generated}`;
    return {wantsPosition, description: description, dispatch: action}
  }

  processQuery(setResponses, startedQuery, url, key, dispatch, counters, showTTW) {
    const query = document.getElementById("query").value;
    key = document.getElementById("key").value;

    /*
    if (showTTW) {
      dispatch(showTrainingTimeWarning(false));
      window.alert("The first query you run will be slower (< 1 minute) because its training the neural nets", 'Warning');
    }
    */

    //const utterances = ["move tank1 to building2", "call tank1 joe"]
    console.log(`sending query ${query}`);
    const utterances = [query]
    const objects = this.props.getObjects()
    objects['types'] = {
                         "position": { "id": "position", "level": 0 },
                         "velocity": { "id": "number", "level": 0 }
                       };
    objects.counters = { tank: 23, building: 32 }
    objects.counters = counters;
    objects.generated_ids = []
    objects.generated_names = []
    objects.newTank = (context) => { 
        let count = context.klass.number || 1;
        let ids = []
        let namess = []
        let currentCount = objects.counters.tank;
        objects.counters.tank += count;
        for (let i = 0; i < count; ++i) {
          ids.push(uuidGen())
          namess.push([`tank${currentCount + i}`, `char${currentCount + i}`]);
        }
        objects.generated_ids = objects.generated_ids.concat(ids)
        objects.generated_names = objects.generated_names.concat(namess)

        return { name: namess[0][0], 'id': ids[0] } 
    }
    objects.newBuilding = (context) => { 
        //return { name: 'building1', 'id': 'building1id' } 
        let count = context.klass.number || 1;
        let ids = []
        let namess = []
        let currentCount = objects.counters.building;
        objects.counters.building += count;
        for (let i = 0; i < count; ++i) {
          ids.push(uuidGen())
          namess.push([`building${currentCount + i}`, `batiment${currentCount + i}`]);
        }
        objects.generated_ids = objects.generated_ids.concat(ids)
        objects.generated_names = objects.generated_names.concat(namess)

        return { name: namess[0][0], 'id': ids[0] } 
    }

    const config = new Config(config_base).add(config_earn).add(config_food);
    config.set('url', url);
    config.set('utterances', [query]);
    config.set('words', this.props.words());
    config.set('objects', objects);
    
    startedQuery();
    client.process(parameters.thinktelligence.url, key, config)
      .then( (responses) => {
        console.log('responses ==============')
        console.log(responses);
        if (responses.errors) {
          window.alert(responses.errors, 'Error');
        } else {
          let actions = []
          let i = 0, j = 0
          responses.results.forEach( (rs) => { 
            rs.forEach((r) => { 
              const g = responses.generated[i][j];
              actions.push(this.processResponse(objects, this.props.addAlias, this.props.stopTank, this.props.placeOrder, this.props.moveTank, this.props.create, this.props.destroy, this.props.showProperty, r, g))
              j += 1;
            } );
            i += 1;
            j = 0;
          } );
          console.log('actions ========================');
          console.log(actions);
          //actions.forEach( ({wantsPosition, dispatch}) => dispatch() );
          setResponses(actions)
        }
      })
      .catch( (error) => {
        console.log('in the catch js');
        console.log(error.stack)
        console.log(error)
        window.alert(error, 'Error');
        const response = {
          description: `Error: ${error}`,
          wantsPosition: false
        }
        setResponses([response])
      })
  }


  render() {
    let wantsPosition = this.props.responses.find( (response) => response.wantsPosition );
    let className = 'query';
    if (wantsPosition) {
      className += ' question';
    }
    return ( 
      <div className={className}>
        { !wantsPosition && 
          <div>
            Request <input id='query' placeholder='some queries are below. there is only one default server' onKeyPress={ 
              (event) => {
                if (event.key === 'Enter') {
                  this.processQuery(this.props.setResponses, this.props.startedQuery, this.props.url, this.props.apiKey, this.props.dispatch, this.props.counters, this.props.showTrainingTimeWarning);
                }
              } }
              type='text' className='request' />
              <Button variant='contained' onClick={() => this.processQuery(this.props.setResponses, this.props.startedQuery, this.props.url, this.props.apiKey, this.props.dispatch, this.props.counters, this.props.showTrainingTimeWarning) }>Submit</Button>
            { this.props.inProcess != 0 && 
              (
                <span className='inProcess'>
                  {this.props.inProcess} request being processed.
                  <SlownessWarning />
                </span>
              )
            }
          </div>
        }
        { wantsPosition && 
          (
            <div className='userRequest'>
              <span>Click on a location for {JSON.stringify(wantsPosition.description)}</span>
            </div>
          )
        }

      </div> 
    )
  }
}

class TankDemo extends Component {
  addAlias = (dispatch) => (id, newName) => {
    console.log('in container add alias xxxxxxxxxxxxxxxxxx');
    dispatch(alias(id, newName));
  };

  stopTank = (dispatch) => (name) => {
    console.log('in container stop tank xxxxxxxxxxxxxxxxxx');
    dispatch(stopTank(name));
  };

  startedQuery = (dispatch) => () => {
    console.log('in container started query xxxxxxxxxxxxxxxxxx');
    dispatch(startedQuery());
  };

  placeOrder = (dispatch) => (item, quanity, who, from) => {
    console.log('in container placeOrder xxxxxxxxxxxxxxxxxx');
    dispatch(placeOrder(item, quanity, who, from));
  };

  moveTank = (dispatch) => (tank, destination) => {
    console.log('in container moveTank xxxxxxxxxxxxxxxxxx');
    dispatch(moveTank(tank, destination));
  };

  create = (dispatch) => (what, count, ids, namess, x, y) => {
    dispatch(createAction(what, count, ids, namess, x, y));
  };

  destroy = (dispatch) => (name) => {
    console.log(destroy);
    dispatch(destroy(name));
  };

  showProperty = (dispatch) => (oname, pname) => {
    dispatch(showProperty(oname, pname));
  };

  setResponses = (dispatch) => (responses) => {
    dispatch(setResponses(responses));
  };

  getWords = (state) => () => {
    return state.words(state)
  };

  getObjects = (state) => () => {
    return state.getObjects(state)
  };

  onClick = (responses, dispatch) => (x, y) => {
    console.log('in outer on click');
    for (let i = 0; i < responses.length; ++i) {
      const response = responses[i]
      if (response.wantsPosition) {
        console.log('doing the dispatch');
        dispatch(setPosition(i, x, y));
      }
    }
  };

  componentDidMount() {
    if (timersOn) {
      this.interval = setInterval( () => {
        //store.dispatch(tick())
        const responses = store.getState().tankDemo.responses;
        if (responses.every( (r) => !r.wantsPosition ) ){
          responses.forEach( (r) => {
            console.log('doing the action dispatch');
            console.log(r);
            store.dispatch(clearResponse(0))
            r.dispatch(r.x, r.y-50);
          });
        }
      }, 1000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    this.url = this.url || this.props.url;
    this.apiKey = this.apiKey || this.props.apiKey
    return ( 
      <div className='tankDemo'>
        <h1>
          <Includes includes={this.props.includes} dispatch={this.props.dispatch}/>
          <span className='credentials'>
            <span className='configProps'>
              Server Url
                <input id='url' type='text' className='url' onChange={ (e) => this.url = e.target.value } defaultValue={this.url}/>
            </span>
            <span className='configProps'>
              Key
              <input id='key' type='text' className='key' onChange={ (e) => this.apiKey = e.target.value } defaultValue={this.apiKey}/>
            </span>
          </span>
          <span className='moduleSource'>
          Config: 
            <a href={`https://github.com/thinktelligence/entodicton/blob/${parameters.version}/kms/website/config_base.js`} target="_blank">base</a>
            <a href={`https://github.com/thinktelligence/entodicton/blob/${parameters.version}/kms/website/config_earn.js`} target="_blank">earn</a>
            <a href={`https://github.com/thinktelligence/entodicton/blob/${parameters.version}/kms/website/config_food.js`} target="_blank">food</a>
          </span>
        </h1>
        <QueryPane 
              responses = {this.props.responses}
              addAlias={this.addAlias(this.props.dispatch)} 
              stopTank={this.stopTank(this.props.dispatch)} 
              placeOrder={this.placeOrder(this.props.dispatch)}
              moveTank={this.moveTank(this.props.dispatch)}
              startedQuery={this.startedQuery(this.props.dispatch)}
              setResponses={this.setResponses(this.props.dispatch)}
              create={this.create(this.props.dispatch)}
              destroy={this.destroy(this.props.dispatch)}
              dispatch={this.props.dispatch}
              showProperty={this.showProperty(this.props.dispatch)}
              inProcess={this.props.inProcess}
              words={this.getWords(this.props)}
              getObjects={this.getObjects(this.props)}
              url={this.url}
              apiKey={this.apiKey}
              showTrainingTimeWarning={this.props.showTrainingTimeWarning}
              counters={ {tank: this.props.tanks.length + 1, building: this.props.buildings.length + 1 } }
              />
        <World responses = {this.props.responses} onClick={this.onClick(this.props.responses, this.props.dispatch)} dispatch={this.props.dispatch} tanks={this.props.tanks} buildings={this.props.buildings} uuidToNames={this.props.uuidToNames} getName={this.props.getName}/>
        { this.props.includes.includes('food') &&
          <FoodOrders orders={this.props.orders}/>
        }
        <Completed completed={this.props.completed}/>
        <Help includes={this.props.includes}/>
      </div> 
    )
  }
}

const mapStateToProps = state => {
  return { ... state.tankDemo, showTrainingTimeWarning: state.subscription.showTrainingTimeWarning };
}

export default connect(mapStateToProps)(TankDemo)
