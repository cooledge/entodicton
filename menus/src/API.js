const makeAPI = (km) => {
  const api = km.base_api()
  class MenusAPI extends api.constructor {
    show(item) {
      debugger
    }

    select(item) {
    }

    unselect(item) {
    }

    cancel(direction) {
    }

    stop(action) {
    }

    setProps(props) {
      this.props = props
    }

    say(message) {
      console.log("say", message)
      // this.props.setMessage(message)
    }
  }

  class UIAPI {
    constructor(menusAPI) {
      this.menusAPI = menusAPI
    }

    initialize() {
    }

    move(direction, steps = 1, units = undefined) {
      this.menusAPI.move(direction, steps, units)
    }

    select(item) {
      this.menusAPI.select(item)
    }

    unselect(item) {
      this.menusAPI.unselect(item)
    }

    cancel(direction) {
      this.menusAPI.cancel(direction)
    }

    stop(action) {
      this.menusAPI.stop(action)
    }

  }
  const menusAPI = new MenusAPI()
  const uiAPI = new UIAPI(menusAPI)

  return { menus: menusAPI, ui: uiAPI }
}

export default makeAPI;
