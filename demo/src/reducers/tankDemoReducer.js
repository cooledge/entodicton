import constants from '../constants/actionTypes'
const uuidGen = require('uuid/v1')
const _ = require('lodash')

const uuid1 = uuidGen();
const uuid2 = uuidGen();
const uuid3 = uuidGen();

var initialState = {
    // { position, id }
    tankCtr: 3,
    buildingCtr: 2,
    tanks: [{id: uuid1, velocity: 2, left: 10, top: 20}, {id: uuid2, velocity: 1, left: 100, top: 200}],
    buildings: [{id: uuid3, velocity: 0, left: 150, top: 150}],
    destinations: {},
    uuidToNames: { [uuid1]: ['tank1', 'char1'], [uuid2]: ['tank2', 'char2'], [uuid3]: ['building1', 'immeuble1'] },
    nameToUUIDs: { 'tank1': [uuid1], 'char1': [uuid1], 'tank2': [uuid2], 'char2': [uuid2], 'building1': [uuid3], 'immeuble1': [uuid3] },
    getName(uuid) {
      return this.uuidToNames[uuid].join('/')
    },
    // { needPosition, description, dispatch } x, y added once they position is found
    responses: [],
    inProcess: 0,
    completed: []
}

function addName(state, id, names) {
  state.uuidToNames[id] = names
  names.forEach( (name) => {
    if (state.nameToUUIDs[name]) {
      state.nameToUUIDs[name].push(name)
    } else {
      state.nameToUUIDs[name] = [id]
    }
  });
}

function removeName(state, name) {
  const uuids = state.nameToUUIDs[name];
  delete state.nameToUUIDs[name];
  console.log('removeName xxxxxxxxxxxxxxxx');
  console.log(uuids);
  uuids.forEach( (id) => delete state.uuidToNames[id] )
}

function newTank(state, left = 0, top = 0, velocity = 0) {
  const id = uuidGen()
  const names = [`tank${state.tankCtr}`, `char${state.tankCtr}`]
  state.tankCtr += 1
  state.tanks.push({id, left, top, velocity})
  addName(state, id, names)
  console.log(state)
}

function newBuilding(state, left = 0, top = 0) {
  const id = uuidGen()
  const names = [`building${state.buildingCtr}`, `immeuble${state.buildingCtr}`]
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
    id = state.nameToUUIDs[nameOrId][0];
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

function updatePosition(state, tank_id, destination_id) {
  const s_obj = getObject(state, tank_id)
  const s_x = s_obj.left;
  const s_y = s_obj.top;

  const d_obj = getObject(state, destination_id)
  const d_x = d_obj.left;
  const d_y = d_obj.top;

  const dx = s_x - d_x;
  const dy = s_y - d_y;
  const angle = Math.atan2(dy, dx);

  const v_x = s_obj.velocity * Math.cos(angle)
  const v_y = s_obj.velocity * Math.sin(angle)

  const n_x = s_x - v_x
  const n_y = s_y - v_y;

  s_obj.left = n_x;
  s_obj.top = n_y;
}

export default (state = initialState, action) => {

  var updated = _.cloneDeep(state);

  switch(action.type) {

    case constants.ALIAS:
      const uuid = updated.nameToUUIDs[action.oldName][0]
      const names = updated.uuidToNames[uuid];
      if (names) {
        names.push(action.newName);
      }
      const uuids = updated.nameToUUIDs[action.newName];
      if (uuids) {
        uuids.push(uuid);
      } else{
        updated.nameToUUIDs[action.newName] = [uuid]
      }

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
      if (action.klass === 'tank') {
        newTank(updated, action.x, action.y);
      } else if (action.klass === 'building') {
        newBuilding(updated, action.x, action.y);
      }
      return updated

    case constants.DESTROY:
      uuids = updated.nameToUUIDs[action.name]
      uuids.forEach( (uuid) => {
        updated.tanks = updated.tanks.filter( (obj) => obj.id !== uuid )
        updated.buildings = updated.buildings.filter( (obj) => obj.id !== uuid )
      });
      removeName(updated, action.name)
      return updated

    case constants.MOVE_TANK:
      const sId = getId(updated, action.tank)
      const dId = getId(updated, action.destination);
      if (sId && dId) {
        updated.destinations[sId] = dId;
      }
      return updated

    case constants.STOP_TANK:
      console.log(action);
      console.log(`id is ${getId(updated, action.name)}`)
      console.log(updated.destinations);
      delete updated.destinations[getId(updated, action.name)]
      return updated

    case constants.FIRE_TANK:
      //delete updated.destinations[action.id]
      return updated

    default:
      return state
  }
}
