import actionTypes from '../constants/actionTypes';

export function alias(id, newName) {
  return {
    type: actionTypes.ALIAS,
    id,
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

export function addInclude(include) {
  return {
    type: actionTypes.ADD_INCLUDE,
    include
  }
}

export function removeInclude(include) {
  return {
    type: actionTypes.REMOVE_INCLUDE,
    include
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

export function createAction(klass, count, ids, namess, x, y) {
  return {
    type: actionTypes.CREATE,
    klass,
    count,
    ids,
    namess,
    x,
    y
  }
}

export function destroy(id) {
  return {
    type: actionTypes.DESTROY,
    id
  }
}

export function showProperty(oname, pname) {
  return {
    type: actionTypes.SHOW_PROPERTY,
    oname,
    pname
  }
}

export function placeOrder(item, quantity, who, from) {
  return {
    type: actionTypes.PLACE_ORDER,
    item,
    quantity,
    who,
    from
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

export function setDemoConfig(server, apiKey) {
  return {
    type: actionTypes.SET_DEMO_CONFIG,
    server,
    apiKey
  }
}

export function tick() {
  return {
    type: actionTypes.TICK,
  }
}

export function setAutoShutoffTimeInMinutes(autoShutoffTimeInMinutes) {
  return {
    type: actionTypes.SET_AUTO_SHUTOFF_TIME_IN_MINUTES,
    autoShutoffTimeInMinutes
  }
}

export function setSubscription(subscription) {
  return {
    type: actionTypes.SET_SUBSCRIPTION,
    subscription
  }
}

export function setLogs(logs) {
  return {
    type: actionTypes.SET_LOGS,
    logs
  }
}

export function setCredentials(subscription_id, password) {
  return {
    type: actionTypes.SET_CREDENTIALS,
    subscription_id,
    password
  }
}
