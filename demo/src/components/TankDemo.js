import React, {Component} from 'react';
import {connect} from 'react-redux';
import tank from '../tank.jpeg';
import building from '../building.png';
import Button from 'react-bootstrap/Button';
//import PropTypes from 'prop-types'
import client from 'entodicton/client'
import { alias, stopTank, moveTank, tick, create, destroy, setPosition, clearResponse, setResponses, startedQuery } from '../actions/actions'
import store from '../stores/store';
import config from './config';

const timersOn = true;

class Sprite extends Component {
  render() {
    return (
      <div
          style={{
            position: 'relative',
            left: `${this.props.left}px`,
            top: `${this.props.top}px`,
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
    const items = config.queries.map((item) => <li>{item}</li>);
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

class Completed extends Component {
  render() {
    console.log(this.props.completed)
    //let items = this.props.completed.map( ([id, response]) => <li key={id}>{response}</li> )
    //let items = [];
    /*
    if (this.props.completed.length > 0) {
      debugger;
      const key = this.props.completed[0][0];
      const name = JSON.stringify(this.props.completed[0][1]);
      items = [(<li key={key}>{name}</li>)]
    }
    */
    let items = this.props.completed.map( (completed) => {
      const key = completed[0];
      const name = JSON.stringify(completed[1]);
      return (<li key={key}>{name}</li>)
    })
    //let items = [(<li key='123'>Nameof item</li>)]
    
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

  processResponse( addAlias, stopTank, moveTank, create, destroy, response ) {
    console.log('in process response xxzzzzzzzzzzzzzzzzzzzzzz');
    console.log(response);
    let action = () => {};
    let wantsPosition = false;
    if (response.action === 'move') {
      const tank = response.thing.marker;
      const destination = response.place.marker;
      action = () => moveTank(tank, destination);
    } else if (response.marker === 'alias') {
      const oldName = response.thing.marker;
      const newName = response.name.marker;
      action = () => addAlias(oldName, newName);
    } else if (response.marker === 'stop') {
      const name = response.thing.marker;
      action = () => stopTank(name);
    } else if (response.marker === 'create') {
      const klass = response.klass.marker;
      wantsPosition = true;
      action = (x, y) => create(klass, x, y);
    } else if (response.marker === 'destroy') {
      const name = response.name.marker;
      action = () => destroy(name);
    }

    return {wantsPosition, description: response, dispatch: action}
  }

  processQuery(setResponses, startedQuery) {
    const query = document.getElementById("query").value;

    //const utterances = ["move tank1 to building2", "call tank1 joe"]
    console.log(`sending query ${query}`);
    const utterances = [query]

    startedQuery();
    console.log(`flatten from config is ${config.flatten} type is ${typeof(config.flatten)} ${config['flatten']}`);
    client.process(config.operators, config.bridges, utterances, config.flatten)
      .then( (responses) => {
        console.log('responses ==============')
        console.log(responses);
        responses = JSON.parse(responses)
        if (responses.errors) {
          window.alert(responses.errors, 'Error');
        } else {
          let actions = []
          responses.results.forEach( (rs) => rs.forEach((r) => actions.push(this.processResponse(this.props.addAlias, this.props.stopTank, this.props.moveTank, this.props.create, this.props.destroy, r))) );
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
            Request <input id='query' onKeyPress={ 
              (event) => {
                if (event.key === 'Enter') {
                  this.processQuery(this.props.setResponses, this.props.startedQuery);
                }
              } }
              type='text'/>
              <Button variant='contained' onClick={() => this.processQuery(this.props.setResponses, this.props.startedQuery) }>Submit</Button>
          </div>
        }
        { wantsPosition && 
          (
            <div className='userRequest'>
              <span>Click on a location for {JSON.stringify(wantsPosition.description)}</span>
            </div>
          )
        }
        { this.props.inProcess != 0 && 
          (
            <div className='inProcess'>
              {this.props.inProcess} request being in processed.
            </div>
          )
        }

      </div> 
    )
  }
}

class TankDemo extends Component {
  addAlias = (dispatch) => (oldName, newName) => {
    console.log('in container add alias xxxxxxxxxxxxxxxxxx');
    dispatch(alias(oldName, newName));
  };

  stopTank = (dispatch) => (name) => {
    console.log('in container stop tank xxxxxxxxxxxxxxxxxx');
    dispatch(stopTank(name));
  };

  startedQuery = (dispatch) => () => {
    console.log('in container started query xxxxxxxxxxxxxxxxxx');
    dispatch(startedQuery());
  };

  moveTank = (dispatch) => (tank, destination) => {
    console.log('in container moveTank xxxxxxxxxxxxxxxxxx');
    dispatch(moveTank(tank, destination));
  };

  create = (dispatch) => (what, x, y) => {
    dispatch(create(what, x, y));
  };

  destroy = (dispatch) => (name) => {
    console.log(destroy);
    dispatch(destroy(name));
  };

  setResponses = (dispatch) => (responses) => {
    dispatch(setResponses(responses));
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

    console.log(this.props.completed);
    return ( 
      <div className='tankDemo'>
        <h1>Control Tanks - 
          <a href='https://github.com/cooledge/entodicton/tree/master/demo'>Source</a>
        </h1>
        <QueryPane 
              responses = {this.props.responses}
              addAlias={this.addAlias(this.props.dispatch)} 
              stopTank={this.stopTank(this.props.dispatch)} 
              moveTank={this.moveTank(this.props.dispatch)}
              startedQuery={this.startedQuery(this.props.dispatch)}
              setResponses={this.setResponses(this.props.dispatch)}
              create={this.create(this.props.dispatch)}
              destroy={this.destroy(this.props.dispatch)}
              inProcess={this.props.inProcess}
              />
        <World responses = {this.props.responses} onClick={this.onClick(this.props.responses, this.props.dispatch)} dispatch={this.props.dispatch} tanks={this.props.tanks} buildings={this.props.buildings} uuidToNames={this.props.uuidToNames} getName={this.props.getName}/>
        <Completed completed={this.props.completed}/>
        <Help/>
      </div> 
    )
  }
}

const mapStateToProps = state => {
  return state.tankDemo;
}

export default connect(mapStateToProps)(TankDemo)
