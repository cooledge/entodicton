const makeAPI = (km) => {
  const api = km.api
  class API extends api.constructor {
    show(item) {
      debugger
    }

    greg() {
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
  return new API()
}

export default makeAPI;
