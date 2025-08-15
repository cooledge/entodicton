const makeAPI = (km) => {
  class RemindersAPI extends km.apiBase() {
    next_id = 0
    add(reminder) {
      reminder.id = ++this.next_id
      reminder.instantiate = () => {
        this.instantiate(reminder)
        if (reminder.nextISODate) {
          const date = new Date(reminder.nextISODate);
          const userLocale = navigator.language || navigator.languages[0] || 'en-US';
          const formattedDate = date.toLocaleString(userLocale, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true, // Use false for 24-hour format
          });
          reminder.nextISODateFormatted = formattedDate
        }
      }
      this.props.setReminders([...this.props.reminders, reminder])
      this.props.setCurrentId(reminder.id)
    }

    say(text) {
    }

    reminder(id) {
      debugger
      return this.props.reminders.find((reminder) => reminder.id == id)
    }

    reminders() {
      return this.props.reminders
    }

    setReminders(reminders) {
      this.props.setReminders(reminders)
    }

    delete_reminder(id) {
      this.props.setReminders(this.props.reminders.filter((reminder) => reminder.id !== id))
    }

    update(update) {
      const updates = []
      for (const item of this.props.reminders) {
        if (item.id == update.id) {
          Object.assign(item, update)
          item.instantiate()
          updates.push(item)
        } else {
          updates.push(item)
        }
      }
      this.props.setReminders(updates)
    }

    setProps(props) {
      this.props = props
    }

    addUser(user) {
      this.props.setReminders(this.props.reminders.map((reminder) => {
        if (reminder.id == this.props.currentId) {
          reminder = {...reminder}
          if (Array.isArray(reminder.who)) {
            reminder.who = [...reminder.who]
            reminder.who.push(user)
          } else {
            reminder.who = [reminder.who, user]
          }
          return reminder
        } else {
          return reminder
        }
      }))
    }

    removeUser(user) {
      this.props.setReminders(this.props.reminders.map((reminder) => {
        if (reminder.id == this.props.currentId) {
          reminder = {...reminder}
          reminder.who = reminder.who.filter((who) => who.remindee_id !== user.remindee_id)
          return reminder
        } else {
          return reminder
        }
      }))
    }

    select(item) {
    }

    unselect(item) {
    }

    cancel(direction) {
    }

    stop(action) {
    }

    move(direction, steps = 1, units = undefined) {
      if (direction == 'up') {
        const i = this.props.reminders.findIndex((reminder) => reminder.id == this.props.currentId)
        if (i-steps >= 0) {
          this.props.setCurrentId(this.props.reminders[i-steps].id)
        }
      } else if (direction == 'down') {
        const i = this.props.reminders.findIndex((reminder) => reminder.id == this.props.currentId)
        if (i+steps < this.props.reminders.length) {
          this.props.setCurrentId(this.props.reminders[i+steps].id)
        }
      }
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

    move(...args) {
      this.remindersAPI.move(...args)
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
