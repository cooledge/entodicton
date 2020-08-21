import constants from '../constants/actionTypes'
const uuidGen = require('uuid/v1')
const _ = require('lodash')
import config from '../components/config';

const idTank1 = 'tank1'
const idTank2 = 'tank2'
const idTank3 = 'tank3'
const idTank4 = 'tank4'
const idBuilding1 = 'building1'
const idBuilding2 = 'building2'
const idBuilding3 = 'building3'

var initialState = {
    orders: [
      {who: 'i', item: 'cheeseburger', quantity: 1, from: 'mcdonalds'}
    ],
    // { position, id }
    tanks: [
      {id: idTank1, velocity: 2, left: 10, top: 20}, 
      {id: idTank2, velocity: 1, left: 100, top: 200},
      {id: idTank3, velocity: 1, left: 400, top: 50},
      {id: idTank4, velocity: 1, left: 300, top: 150},
    ],
    buildings: [
      {id: idBuilding1, velocity: 0, left: 150, top: 150},
      {id: idBuilding2, velocity: 0, left: 350, top: 55},
      {id: idBuilding3, velocity: 0, left: 650, top: 25}
    ],
    destinations: {},
    uuidToNames: { 
      [idTank1]: ['tank1', 'char1'], 
      [idTank2]: ['tank2', 'char2'],
      [idTank3]: ['tank3', 'char3'],
      [idTank4]: ['tank4', 'char4'],
      [idBuilding1]: ['building1', 'batiment1'],
      [idBuilding2]: ['building2', 'batiment2'],
      [idBuilding3]: ['building3', 'batiment3'],
    },
    nameToUUIDs: { 
      'tank1': [idTank1], 
      'char1': [idTank1], 
      'tank2': [idTank2], 
      'char2': [idTank2], 
      'tank3': [idTank3], 
      'tank3': [idTank3], 
      'char4': [idTank4], 
      'char4': [idTank4], 
      'building1': [idBuilding1], 
      'batiment1': [idBuilding1],
      'building2': [idBuilding2], 
      'batiment2': [idBuilding2],
      'building3': [idBuilding3], 
      'batiment3': [idBuilding3],
    },
    getName(uuid) {
      return this.uuidToNames[uuid].join('/')
    },
    words(state) {
      const ws = Object.assign({}, config.words);
      addWords(state, ws)
      return ws
    },
    // { needPosition, description, dispatch } x, y added once they position is found
    responses: [],
    inProcess: 0,
    completed: []
}
initialState.tankCtr = initialState.tanks.length + 1
initialState.buildingCtr = initialState.buildings.length + 1

const addDef = (words, word, def) => {
  if (!words[word]) {
    words[word] = []
  }
  const defs = words[word]
  if (!defs.find( (d) => JSON.stringify(d, def) )) {
    defs.push(def)
  }
};

const addWordForObject = (state, words, id, name) => {
  let object = state.tanks.find( (o) => o.id == id );
  let concept;
  if (object) {
    concept = 'tankConcept';
  } else{
    object = state.buildings.find( (object) => object.id == id );
    if (!object) {
      return
    }
    concept = 'buildingConcept';
  }

  const def = {
      "id": concept,
      "initial": {
        "id": object.id
    }
  };

  addDef(words, name, def);
};

const addWordsForConcept = (state, words, objects, concept) => {
  objects.forEach( (object) => {
    state.uuidToNames[object.id].forEach( (name) => {
      console.log(`Adding words for ${object} + ${name}`);
      addWordForObject(state, words, object.id, name)
    })
  });
};
const addWords = (state, words) => {
  addWordsForConcept(state, words, state.tanks, 'tankConcept')
  addWordsForConcept(state, words, state.buildings, 'buildingConcept')
}

function addName(state, id, names) {
  state.uuidToNames[id] = names
  names.forEach( (name) => {
    addWordForObject(state, id, name)
    if (state.nameToUUIDs[name]) {
      state.nameToUUIDs[name].push(name)
    } else {
      state.nameToUUIDs[name] = [id]
    }
  });
}

function removeNames(state, uuid) {
  const names = state.uuidToNames[uuid]
  delete state.uuidToNames[uuid]

  names.forEach( (name) => {
    const uuids = state.nameToUUIDs[name];
    if (state.nameToUUIDs[name]) {
      state.nameToUUIDs[name] = state.nameToUUIDs[name].filter( (v) => v != uuid );
    }
  });
}

function newTank(state, left = 0, top = 0, velocity = 1) {
  console.log('newTank ggggggggggggggggggggggggggggg');
  const id = uuidGen()
  const names = [`tank${state.tankCtr}`, `char${state.tankCtr}`]
  state.tankCtr += 1
  state.tanks.push({id, left, top, velocity})
  addName(state, id, names)
  console.log(state)
}

function newBuilding(state, left = 0, top = 0) {
  const id = uuidGen()
  const names = [`building${state.buildingCtr}`, `batiment${state.buildingCtr}`]
  state.buildingCtr += 1
  state.buildings.push({id, left, top})
  addName(state, id, names)
  console.log(state)
}

function getObject(state, nameOrId) {
  let id;
  if (state.uuidToNames[nameOrId]) {
    id = nameOrId
  } else {
    if (state.nameToUUIDs[nameOrId]) {
      id = state.nameToUUIDs[nameOrId][0];
    } else {
      return null;
    }
  }

  return state.tanks.find((obj) => obj.id === id) || state.buildings.find((obj) => obj.id === id);
}

function getId(state, name) {
  const obj = getObject(state, name);
  if (obj) {
    return obj.id;
  }
  return null;
}

function getIds(state, name) {
  if (name.marker == 'tankConcept'  && name.number == 'all') {
    return state.tanks.map( (tank) => tank.id )
  } else if (name.marker == 'buildingConcept'  && name.number == 'all') {
    return state.buildings.map( (tank) => tank.id )
  }
  return getObject(state, name);
}

function updatePosition(state, tank_id, destination_id) {
  console.log(`updatePosition(${tank_id}, ${destination_id})`);
  const s_obj = getObject(state, tank_id)
  const s_x = s_obj.left;
  const s_y = s_obj.top;

  const d_obj = getObject(state, destination_id)
  const d_x = d_obj.left;
  const d_y = d_obj.top;

  const dx = s_x - d_x;
  const dy = s_y - d_y;
  const angle = Math.atan2(dy, dx);

  /*
  const dist = Math.sqrt(dx*dx + dy*dy)
  const full_x = dist * Math.cos(angle)
  const full_y = dist * Math.sin(angle)
  const new_x = s_x - full_x
  const new_y = s_y - full_y
  */

  const v_x = s_obj.velocity * Math.cos(angle)
  const v_y = s_obj.velocity * Math.sin(angle)

  const n_x = s_x - v_x
  const n_y = s_y - v_y;

  s_obj.left = n_x;
  s_obj.top = n_y;
}

export default (state = initialState, action) => {

  var updated = _.cloneDeep(state);

  console.log(`In reducer for ${action.type}`);
  switch(action.type) {

    case constants.ALIAS:
      const uuid = action.id;
      const names = updated.uuidToNames[uuid];
      if (names.find((i) => i == action.newName)) {
        return;
      }
      if (names) {
        names.push(action.newName);
      }
      const uuids = updated.nameToUUIDs[action.newName];
      if (uuids) {
        uuids.push(uuid);
      } else{
        updated.nameToUUIDs[action.newName] = [uuid]
      }
      addWordForObject(updated, uuid, action.newName)

      return updated

    case constants.TICK:
      Object.keys(updated.destinations).forEach( (obj) => {
        updatePosition(updated, obj, updated.destinations[obj]);
      });

      return updated

    case constants.CLEAR_RESPONSE:
      console.log('before')
      console.log(updated.responses);
      updated.responses.splice(action.index, 1)
      console.log('after')
      console.log(updated.responses);
      return updated

    case constants.SET_POSITION:
      console.log('is dispatch');
      console.log(action);
      const response = updated.responses[action.index]
      response.x = action.x
      response.y = action.y
      response.wantsPosition = false;
      return updated

    case constants.SET_RESPONSES:
      updated.responses = updated.responses.concat(action.responses)
      updated.inProcess -= 1;
      updated.completed = action.responses.map( (r) => [uuidGen(), r]).concat(updated.completed)
      return updated

    case constants.STARTED_QUERY:
      console.log("in reducer for STARTED_QUERY");
      updated.inProcess += 1;
      return updated

    case constants.CREATE:
      console.log('in reducer');
      console.log(action);
      for ( let i = 0; i < action.count; ++i ) {
        if (action.klass === 'tankConcept') {
          newTank(updated, action.x, action.y);
        } else if (action.klass === 'buildingConcept') {
          newBuilding(updated, action.x, action.y);
        }
      }
      return updated

    case constants.DESTROY:
      // updated.tanks = updated.tanks.filter( (obj) => obj.id !== action.id )
      const sIds = getIds(updated, action.id)
       
      sIds.forEach( (id) => {
        updated.tanks = updated.tanks.filter( (obj) => obj.id !== id )
        updated.buildings = updated.buildings.filter( (obj) => obj.id !== id )
        removeNames(updated, id)
      });
      return updated

    case constants.SHOW_PROPERTY:
      uuids = updated.nameToUUIDs[action.oname]
      uuids.forEach( (uuid) => {
        var tank = getObject(state, uuid);
        var value;
        switch (action.pname) {
          case 'speed': 
            value = tank.velocity
            break
          case 'position':
            value = `(top, left) == (${tank.top}, ${tank.left})`
            break
          case 'id':
            value = tank.id
            break
        }
        if (value) {
          updated.completed = [[uuidGen(), `the ${action.pname} of ${action.oname} is ${value}`]].concat(updated.completed)
        } else {
          updated.completed = [[uuidGen(), `unknown property '${action.pname}'`]].concat(updated.completed)
        }
      });
      return updated

    case constants.PLACE_ORDER:
      console.log("In PLACE_ORDER reducer");
      const order = { item: action.item, quantity: action.quantity, who: action.who, from: action.from }
      console.log(order);
      updated.orders.unshift(order);
      console.log(updated.orders);
      return updated

    case constants.MOVE_TANK: {
      const dId = getId(updated, action.destination);
      if (!dId) {
        return;
      }

      const sIds = getIds(updated, action.tank)
      sIds.forEach( (sId) => {
        console.log(`Doing move of ${sId} to ${dId}`);
        updated.destinations[sId] = dId;
      });
      return updated
    }

    case constants.STOP_TANK: {
      console.log(action);
      console.log(`id is ${getId(updated, action.name)}`)
      console.log(updated.destinations);

      const sIds = getIds(updated, action.name)
      sIds.forEach( (sId) => {
        delete updated.destinations[sId]
      });
      return updated
    }

    case constants.FIRE_TANK:
      //delete updated.destinations[action.id]
      return updated

    default:
      return state
  }
}
