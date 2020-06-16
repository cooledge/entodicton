import actionTypes from '../constants/actionTypes';

export function alias(oldName, newName) {
  return {
    type: actionTypes.ALIAS,
    oldName,
    newName
  }
}

export function setPosition(index, x, y) {
  return {
    type: actionTypes.SET_POSITION,
    index,
    x,
    y
  }
}

export function clearResponse(index) {
  return {
    type: actionTypes.CLEAR_RESPONSE,
    index
  }
}

export function setResponses(responses) {
  return {
    type: actionTypes.SET_RESPONSES,
    responses
  }
}

export function startedQuery() {
  return {
    type: actionTypes.STARTED_QUERY,
  }
}

export function create(klass, x, y) {
  return {
    type: actionTypes.CREATE,
    klass,
    x,
    y
  }
}

export function destroy(name) {
  return {
    type: actionTypes.DESTROY,
    name
  }
}

export function showProperty(oname, pname) {
  return {
    type: actionTypes.SHOW_PROPERTY,
    oname,
    pname
  }
}

export function moveTank(tank, destination) {
  return {
    type: actionTypes.MOVE_TANK,
    tank,
    destination
  }
}

export function stopTank(name) {
  return {
    type: actionTypes.STOP_TANK,
    name,
  }
}

function fireTank(tank, building_or_tank) {
  return {
    type: actionTypes.FIRE_TANK,
    tank,
    building_or_tank
  }
}

export function tick() {
  return {
    type: actionTypes.TICK,
  }
}

/*
export function addAlias(oldName, newName) {
  return dispatch => {
    dispatch(alias(oldName, newName));
  }
}

export function moveTank(tank, destination) {
  return dispatch => {
    dispatch(moveTank(tank, destination));
  }
}
*/
