import constants from '../constants/actionTypes'
const _ = require('lodash')
import config from '../components/config';

var initialState = {
  subscription: {},
  logs: '',
  subscription_id: '',
  password: '',
}

export default (state = initialState, action) => {
  var updated = _.cloneDeep(state);

  switch(action.type) {
    case constants.SET_SUBSCRIPTION:
      if (JSON.stringify(action.subscription) == JSON.stringify(updated.subscription)) {
        return state;
      }
      updated.subscription = action.subscription
      return updated

    case constants.SET_LOGS:
      if (action.logs == updated.logs) {
        return state;
      }
      updated.logs = action.logs
      return updated

    case constants.SET_CREDENTIALS:
      updated.subscription_id =  action.subscription_id
      updated.password = action.password;
      return updated

    default:
      return state
  }
}
