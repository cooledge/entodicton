import React, {Component, Checkbox} from 'react';
import { addInclude, removeInclude } from '../actions/actions'
import config_base from './config_base';
import config_earn from './config_earn';
import config_food from './config_food';

const all = ['base', 'earn', 'food']

const nameToConfig = {
  'earn': config_earn,
  'food': config_food
}

class Includes extends Component {
  remove(dispatch, name) {
    alert(`The following type of input will no longer work:\n\n ${nameToConfig[name].utterances.join("\n")}`);
    dispatch(removeInclude(name)) 
  }

  add(dispatch, name) {
    dispatch(addInclude(name)) 
  }

  render() {
    const includes = this.props.includes
    const dispatch = this.props.dispatch;
    const bs = all.map( (name) => {
      if (name == 'base') {
        return (<button className="selected" onClick={() => alert("Not removable")}>{name} knowledge module</button>) 
      } else if (includes.includes(name)) {
        return (<button className="selected" onClick={() => this.remove(dispatch, name)}>{name} knowledge module</button>) 
      } else {
        return (<button onClick={() => this.add(dispatch, name)}>{name} knowledge module</button>) 
      }
    });
    return (
      <div className='includes'>
        {bs}
      </div>
    );
  }
};

export default Includes;
