const makeAPI = (km) => {
  class RemindersAPI extends km.apiBase() {
    add(reminder) {
      this.props.setReminders([...this.props.reminders, reminder])
    }

    say(text) {
      debugger
    }

    askAbout() {
    }

    show() {
    }

    delete_reminder(ordinal) {
    }

    update(update) {
    }

    setProps(props) {
      this.props = props
    }

    select(item) {
    }

    unselect(item) {
    }

    cancel(direction) {
    }

    stop(action) {
    }

  }

  class UIAPI extends km.apiBase('ui') {
    constructor(remindersAPI) {
      super()
      this.remindersAPI = remindersAPI
    }

    initialize() {
    }

    select(item) {
      this.remindersAPI.select(item)
    }

    unselect(item) {
      this.remindersAPI.unselect(item)
    }

    cancel(direction) {
      this.remindersAPI.cancel(direction)
    }

    stop(action) {
      this.remindersAPI.stop(action)
    }

    setProps(props) {
      this.props = props
    }

  }
  const remindersAPI = new RemindersAPI()
  const uiAPI = new UIAPI(remindersAPI)

  return { reminders: remindersAPI, ui: uiAPI }
}

export default makeAPI;
