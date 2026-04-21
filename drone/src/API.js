const DEBUG = true

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const makeAPI = (km) => {
  class API extends km.apiBase() {
    constructor() {
      super()
      this.batch = []
      this.setStartPoint({ x: 5, y: 5 })
      this.setStartAngle(0, 'east')
      this.sayHandler = (text) => console.log(text)
      {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        this.unittest = urlParams.get('unittest');
      }
    }

    setSayHandler(sayHandler) {
      this.sayHandler = sayHandler
    }

    setProps(props) {
      this.props = props
      this.sprite = this.props.spriteRef.current;
    }

    say(text) {
      this.sayHandler(text)
    }

    now() {
      return new Date()
    }

    minimumSpeedDrone() {
      return 0.1
    }

    maximumSpeedDrone() {
      return this.unittest ? 100 : 1
    }

    async pauseDrone(durationInSeconds, options = {}) {
      if (DEBUG) {
        console.log("pause (seconds)", durationInSeconds)
      }
      if (options.batched) {
        this.batch.push(async () => await sleep(durationInSeconds*1000))
      } else {
        await sleep(durationInSeconds*1000)
      }
    }

    async armActionDrone(action, options = {}) {
      if (DEBUG) {
        console.log("armAction", action)
      }
    }

    async clawActionDrone(action, options = {}) {
      if (DEBUG) {
        console.log("clawAction", action)
      }
    }

    async forwardDrone(speed, options = {}) {
      if (DEBUG) {
        console.log("forward", speed, 'm/s')
      }

      if (options.batched) {
        this.batch.push(async () => await this.sprite.forward(speed))
      } else {
        this.sprite.forward(speed)
      }
    }

    async backwardDrone(speed, options = {}) {
      if (DEBUG) {
        console.log("backward", speed, 'm/s')
      }
      if (options.batched) {
        this.batch.push(async () => await this.sprite.backward(speed))
      } else {
        this.sprite.backward(speed)
      }
    }

    async rotateDrone(angleInRadians, options = {}) {
      if (DEBUG) {
        console.log("rotate", angleInRadians)
      }
      if (options.batched) {
        this.batch.push(async () => await this.sprite.rotate(-angleInRadians))
      } else {
        this.sprite.rotate(-angleInRadians)
      }
    }

    async stopDrone(options = {}) {
      if (DEBUG) {
        console.log("stop")
      }
      if (options.batched) {
        this.batch.push(async () => await this.sprite.stop())
      } else {
        this.sprite.stop()
      }
    }

    async sonicDrone() {
      if (DEBUG) {
        console.log("sonic")
      }
    }

    async startRepeatsDrone(n) {
      if (DEBUG) {
        console.log("startRepeats")
      }
      this.batch.push({ startRepeats: true, n })
    }

    async endRepeatsDrone() {
      if (DEBUG) {
        console.log("endRepeats")
      }
      this.batch.push({ endRepeats: true })
    }

    async sendBatchDrone() {
      if (DEBUG) {
        console.log("sendBatch")
      }

      let loop = false
      let commands
      let n
      for (const command of this.batch) {
        if (command.startRepeats) {
          loop = true
          n = command.n
          commands = []
        } else if (command.endRepeats) {
          loop = false
          while (n) {
            n = n-1
            for (const c of commands) {
              await c()
            }
          }
        } else if (loop) {
          commands.push(command)
        } else {
          await command()
        }
      }
      this.batch = []
    }

    async tiltAngleDrone(options = {}) {
      if (DEBUG) {
        console.log("tiltAngleDrone")
      }
    }

    async panAngleDrone(options = {}) {
      if (DEBUG) {
        console.log("panAngleDrone")
      }
    }
  }

  return () => new API()
}

export default makeAPI;
