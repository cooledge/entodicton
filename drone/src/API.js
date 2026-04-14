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
      this.setStartAngle(Math.PI, 'west')
    }

    setProps(props) {
      this.props = props
      this.sprite = this.props.spriteRef.current;
    }

    say(text) {
      console.log(text)
    }

    now() {
      return new Date()
    }

    minimumSpeedDrone() {
      return 0.1
    }

    maximumSpeedDrone() {
      return 1
    }

    async pauseDrone(durationInSeconds, options = {}) {
      if (DEBUG) {
        console.log("pause", durationInSeconds)
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
        this.batch.push(async () => this.sprite.forward(speed))
      } else {
        this.sprite.forward(speed)
      }
    }

    async backwardDrone(speed, options = {}) {
      if (DEBUG) {
        console.log("backward", speed, 'm/s')
      }
      if (options.batched) {
        this.batch.push(async () => this.sprite.backward(speed))
      } else {
        this.sprite.backward(speed)
      }
    }

    async rotateDrone(angleInRadians, options = {}) {
      if (DEBUG) {
        console.log("rotate", angleInRadians)
      }
      if (options.batched) {
        this.batch.push(async () => this.sprite.rotate(-angleInRadians))
      } else {
        this.sprite.rotate(-angleInRadians)
      }
    }

    async stopDrone(options = {}) {
      if (DEBUG) {
        console.log("stop")
      }
      if (options.batched) {
        this.batch.push(async () => this.sprite.stop())
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
    }

    async endRepeatsDrone() {
      if (DEBUG) {
        console.log("endRepeats")
      }
    }

    async sendBatchDrone() {
      if (DEBUG) {
        console.log("sendBatch")
      }
      for (const command of this.batch) {
        await command()
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
