const makeAPI = (km) => {
  class RemindersAPI extends km.apiBase() {
    next_id = 0
    add(reminder) {
      reminder.id = ++this.next_id
      this.props.setReminders([...this.props.reminders, reminder])
    }

    say(text) {
    }

    askAbout() {
      const items = []
      for (const item of this.props.reminders) {
        if (!item.when) {
          items.push({ when: true, text: item.text, id: item.id })
        }
      }
      return items
    }

    show() {
    }

    delete_reminder(ordinal) {
      if (ordinal < 1 || ordinal > this.props.reminders.length) {
        return `Not possible`
      }
      this.props.setReminders(this.props.reminders.splice(ordinal, 1))
    }

    update(update) {
      const updates = []
      for (const item of this.props.reminders) {
        if (item.id == update.id) {
          updates.push({...item, ...update})
        } else {
          updates.push(item)
        }
      }
      this.props.setReminders(updates)
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
