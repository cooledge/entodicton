import constants from '../constants/actionTypes'
import config from '../components/config';
const _ = require('lodash')

var initialState = {
  subscription: {},
  logs: '',
  subscription_id: '',
  password: '',
  autoShutoffTimeInMinutes: 120,
  product: {},
  showTrainingTimeWarning: false
}

export default (state = initialState, action) => {
  var updated = _.cloneDeep(state);

  switch(action.type) {
    case constants.SET_AUTO_SHUTOFF_TIME_IN_MINUTES:
      debugger;
      updated.autoShutoffTimeInMinutes = action.autoShutoffTimeInMinutes
      return updated

    case constants.SHOW_TRAINING_TIME_WARNING:
      updated.showTrainingTimeWarning = action.show
      return updated

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
