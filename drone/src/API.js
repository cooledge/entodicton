const makeAPI = (km) => {
  class MenusAPI extends km.apiBase() {
    show(item) {
      debugger
      const path = this._objects.directions.paths[item]
      if (path && path[0]) {
        this.props.setOpenKeys([path[0]])
        if (path[1]) {
          this.props.setSelectedKeys([path[1]])
        } else {
          this.props.setSelectedKeys([])
        }
      } else {
        this.props.setOpenKeys([])
      }
    }

    current() {
      if (this.props.selectedKeys.length > 0) {
        return this.props.selectedKeys[this.props.selectedKeys.length-1]
      } else if (this.props.openKeys.length > 0) {
        return this.props.openKeys[this.props.openKeys.length-1]
      }
    }

    close() {
      this.props.setOpenKeys([])
    }

    select(item) {
      debugger
    }

    unselect(item) {
      debugger
    }

    cancel(direction) {
      debugger
    }

    stop(action) {
      debugger
    }

    setProps(props) {
      this.props = props
    }

    say(message) {
      console.log("say", message)
      // this.props.setMessage(message)
    }
  }

  class UIAPI extends km.apiBase('ui') {
    constructor(menusAPI) {
      super()
      this.menusAPI = menusAPI
    }

    initialize() {
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
