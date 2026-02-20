// tank-client.js
const net = require('net');
const fs = require('fs')
const defaultConfiguration = require('./configuration.json')

// dear people who do node, make a built in function with a memorable name for sleep instead of this monostrosity which i can never fucking remember

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const MAX_POWER = 4095;
const POWER_INCREMENT = 100;
const MIN_DISTANCE_FOR_CALIBRATION_IN_CM = 10
const DEBUG = false
const BLOCKING = false

function percentToPower(percent) {
  return percent * MAX_POWER / 100
}

class TankClient {
  constructor(host, port = 5003) {
    this.host = host;
    this.port = port;
    this.socket = null;
    this.connected = false;
    this.commandQueue = [];
    this.responseQueue = [];  // FIFO queue for incoming server messages
    this.configuration = { ...defaultConfiguration }
    this.debug = DEBUG
  }

  async readLine(prompt = '> ') {
    process.stdout.write(prompt);

    return new Promise((resolve) => {
      process.stdin.once('data', (data) => {
        const input = data.toString().trim();
        resolve(input);
      });
    });
  }

  async sendBatchDrone() {
    if (this.commandQueue.length == 0) {
      return
    } 

    let batchCMD = 'CMD_MULTI'
    // eg: tank.send(`CMD_MULTI$CMD_MOTOR#1000#1000#$CMD_PAUSE#2000#$CMD_MOTOR#0#0#`);
    let separator = '$'
    for (const cmd of this.commandQueue) {
      batchCMD += separator + cmd
    }
    this.commandQueue = []
    console.log("batchCMD", batchCMD)
    return await this.send(batchCMD, { awaitDone: true })
  }

  async processCommand(cmd, options = {}) {
    // return await this.send(cmd)
    this.commandQueue.push(cmd)
    if (options.batched) {
      return
    } else {
      if (this.commandQueue.length == 0) {
        return await this.send(cmd)
      } else {
        await this.sendBatchDrone()
      }
    }
  }

  async connect() {
    if (this.connected) {
      console.log('Already connected');
      return;
    }

    return new Promise((resolve, reject) => {
      this.socket = new net.Socket();

      this.socket.on('connect', () => {
        this.connected = true;
        console.log(`Connected to Freenove Tank at ${this.host}:${this.port}`);
        resolve();
      });

      this.socket.on('error', (err) => {
        console.error('Connection error:', err.message);
        reject(err);
      });

      this.socket.on('close', () => {
        console.log('Connection closed');
        this.connected = false;
      });

      this.socket.on('data', (data) => {
        const msg = data.toString().trim();
        // console.log(`Tank server says: ${msg}`);
        this.responseQueue.push(msg);
      });

      this.socket.connect(this.port, this.host);
    });
  }

  /**
   * Send a command and wait for the next server response (or timeout)
   * @param {string} command
   * @param {number} [timeoutMs=1500] - max wait time for response
   * @returns {Promise<string|null>} - server response or null
   */
  async send(command, { timeoutMs = 1500, awaitDone = false } = {}) {
    if (!this.connected || !this.socket) {
      throw new Error('Not connected');
    }

    // Optional: clear stale responses
    this.responseQueue = [];

    const fullCmd = command.trim() + '\n';

    return new Promise(async (resolve) => {
      this.socket.write(fullCmd, (err) => {
        if (err) {
          console.error('Write error:', err.message);
          resolve(null);
        }
        // console.log(`Sent: ${fullCmd.trim()}`);
      });

      const start = Date.now();
      const interval = setInterval(() => {
        // console.log("interval")
        if (this.responseQueue.length > 0) {
          if (awaitDone && BLOCKING) {
            const response = this.responseQueue.shift();
            if (response === 'DONE') {
              clearInterval(interval);
              resolve(response)
            }
          } else {
            clearInterval(interval);
            resolve(this.responseQueue.shift());
          }
        } else if (!awaitDone && (Date.now() - start > timeoutMs)) {
          clearInterval(interval);
          resolve(null); // no response in time
        }
      }, 30); // check ~every 30ms
      await interval
    });
  }

  minimumDroneSpeed() {
    return this.configuration.speedForward
  }

  maximumDroneSpeed() {
    return this.configuration.maximumSpeedForward
  }

  async pauseDrone(durationInSeconds, options) {
    return await this.processCommand(`CMD_PAUSE#${Math.round(durationInSeconds*1000)}#`, options);
  }

  forwardSpeedToPower(speed) {
    return Math.round((speed / this.configuration.maximumSpeedForward) * MAX_POWER)
  }

  backwardSpeedToPower(speed) {
    return Math.round((speed / this.configuration.maximumSpeedBackward) * MAX_POWER)
  }

  async moveDrone(speedLeft, speedRight, options) {
    if (this.debug) {
      console.log("speedLeftIn", speedLeft)
      console.log("speedRightIn", speedRight)
    }
    let powerLeft, powerRight
    if (options.usingPower) {
      powerLeft = speedLeft
      powerRight = speedRight
    } else {
      powerLeft = this.forwardSpeedToPower(speedLeft)
      powerRight = this.backwardSpeedToPower(speedRight)
    }
    if (this.debug) {
      console.log(JSON.stringify(this.configuration, null, 2))
      console.log("powerLeft", powerLeft)
      console.log("powerRight", powerRight)
    }
    return await this.processCommand(`CMD_MOTOR#${Math.round(powerLeft)}#${Math.round(powerRight)}#`, options);
  }

  // Movement methods – now return server response
  async forwardDrone(speed, options) {
    if (!options.skipPause) {
      await this.stopDrone(options)
      await this.pauseDrone(0.1, options)
    }
    return await this.moveDrone(speed, speed, options)
  }

  /*
    L = track separation width (distance between the centers of the two tracks, measured side-to-side, in meters or whatever unit you like)

    v = ground speed of each track (in m/s) — assume same magnitude but opposite directionsleft track forward at +v
    right track backward at -v (or vice versa for the other direction)

    θ = desired turn angle in radians (convert degrees to radians with θ_rad = θ_deg × π / 180)

    The angular velocity ω (how fast the tank rotates, in rad/s) is:

      ω = 2v / L

    The time t needed to turn by angle θ is:

      t = θ / ω = (θ × L) / (2v)
  */

  async learnFrictionFactor(options) {
    const rotation = this.configuration.rotation
    if (!rotation.positive) {
      rotation.positive = {
        1: {},
        4: {},
      }
    }
    if (!rotation.negative) {
      rotation.negative = {
        1: {},
        4: {},
      }
    }

    await this.learnFrictionFactorHelper('clockwise', 1, options)
    await this.learnFrictionFactorHelper('clockwise', 4, options)
    await this.learnFrictionFactorHelper('counter clockwise', 1, options)
    await this.learnFrictionFactorHelper('counter clockwise', 4, options)
    
    this.calculateRotateFormulas()
  }

  // x is radians
  // y is frictionFactor
  calculateRotateFormulasHelper(points) {
    const rise = points[1].frictionFactor - points[4].frictionFactor
    const run = (Math.PI*2/1 - Math.PI*2/4)
    points.m = rise/run
    points.b = points[1].frictionFactor - points.m*Math.PI*2/1
    points.speedIncrease = Math.max(points[1].speedIncrease, points[4].speedIncrease) 
  }

  calculateRotateFormulas() {
    const rotation = this.configuration.rotation
    this.calculateRotateFormulasHelper(rotation.positive)
    this.calculateRotateFormulasHelper(rotation.negative)
  }

  calculateFrictionFactor(direction, x) {
    const { m, b } = this.configuration.rotation[direction]
    return m*Math.abs(x) + b
  }

  async learnFrictionFactorHelper(direction, times, options) {
    const factor = (direction == 'clockwise' ? -1 : 1)
    const rffInc = 0.25

    await this.readLine(`The drone will rotate ${direction.toUpperCase()} once times in ${times} turn(s). Notice if the drone rotates too long or too short of one rotation. This will be used to calculate a factor that accounts for friction in the ${direction} rotation. Getting within 5 degrees after three rotations is about as good as my drone gets. Press enter to continue`)
    const properties = this.configuration.rotation[factor < 0 ? 'negative' : 'positive'][times]
    let current = 0
    // greg55

    let lrff, srff
    // const fakeInput = ['s', 'l', 's']
    properties.frictionFactor = 0
    properties.speedIncrease = 0.30 // the sometimes needs to go faster than the minimum power
    while (true) {
      if (this.debug) {
        console.log(`\nsrff/current/lrff ${srff}/${current}/${lrff}`)
      }
      properties.frictionFactor = current
      if (this.debug) {
        console.log(JSON.stringify(this.configuration, null, 2))
        console.log(JSON.stringify(this.properties, null, 2))
      }
      this.rotateDrone(2*Math.PI*factor/times, { ...options, times, pause: 0.2, rotateFrictionFactor: current, speedIncrease: properties.speedIncrease })
      const result = await this.readLine(`Was the rotation short or long of one full rotation, (s for short, l for long, r for repeat, f for drone needs to rotate faster, 0 for restart,  or d for done)?`)
      // const result = fakeInput.pop()
      if (result == 's') {
        if (srff == null) {
          srff = current
        }
        if (lrff == null) {
          srff = current
          current += rffInc
        } else {
          srff = current
          current += (lrff-current) / 2
        }
      } else if (result == 'f' || result == '0') {
          lrff = null
          srff = null
          current = 0
          if (result == 'f') {
            properties.speedIncrease += 0.05
          }
          properties.frictionFactor = 0
      } else if (result == 'l') {
        if (lrff == null) {
          lrff = current
        }
        if (srff == null) {
          lrff = current
          current -= rffInc
        } else {
          lrff = current
          current += (srff-current) / 2
        }
      } else if (result == 'd') {
        console.log(JSON.stringify(this.calibration, null, 2))
        return
      }
    }
  }

  async calibrateSpeed() {
    const moveTimeInSeconds = 0.5

    await this.readLine("Place an object about 60 cm/2 feet in front of the drone for example aim the drone at a wall. Press enter to continue. ")

    const debug = true

    // find where drone moves at least 10 cm forward then calibrate off that
    let power
    let forwardDistanceInCM = 0
    let backwardDistanceInCM = 0
    let start = await this.sonicDrone();
    for (power = POWER_INCREMENT; power < MAX_POWER; power += POWER_INCREMENT) {
      if (debug) {
        console.log('power', power)
      }

      // go forward 
      {
        await this.forwardDrone(power, { batched: true, skipPause: true, usingPower: true })
        await this.pauseDrone(moveTimeInSeconds, { batched: true })
        await this.stopDrone()
      }

      const endForward = await this.sonicDrone();

      if (endForward !== start) {
        forwardDistanceInCM = start - endForward

        // backward speed / position reset
        {
          await this.backwardDrone(power, { batched: true, skipPause: true, usingPower: true })
          await this.pauseDrone(moveTimeInSeconds, { batched: true })
          await this.stopDrone()
          const endBackward = await this.sonicDrone();
          backwardDistanceInCM = endBackward - endForward
        }

        if (debug) {
          console.log("forwardDistanceInCM", forwardDistanceInCM)
          console.log("backwardDistanceInCM", backwardDistanceInCM)
        }
        if (forwardDistanceInCM >= MIN_DISTANCE_FOR_CALIBRATION_IN_CM && backwardDistanceInCM >= MIN_DISTANCE_FOR_CALIBRATION_IN_CM) {
          break;
        } else {
          start = await this.sonicDrone();
        }
      }
    }
    const metersPerSecondForward = (forwardDistanceInCM/100)/moveTimeInSeconds
    const metersPerSecondBackward = (backwardDistanceInCM/100)/moveTimeInSeconds

    this.configuration.minPower = power
    this.configuration.power = power
    this.configuration.speedForward = metersPerSecondForward
    this.configuration.maximumSpeedForward = MAX_POWER / power * metersPerSecondForward
    this.configuration.speedBackward = metersPerSecondBackward
    this.configuration.maximumSpeedBackward = MAX_POWER / power * metersPerSecondBackward
    this.configuration.isCalibrated = true

    if (debug) {
      console.log(JSON.stringify(this.configuration, null, 2))
    }
  }

  async configureDrone() {
    const widthOfTankInMM = await this.readLine(`Enter the width of the tank in mm or enter to keep the current value ${this.configuration.widthOfTankInMM} mm.`)
    if (Number.isInteger(parseInt(widthOfTankInMM))) {
      this.configuration.widthOfTankInMM = Number.isInteger(parseInt(widthOfTankInMM))
    }

    const widthOfTreadInMM = await this.readLine(`Enter the width of the tank tread in mm or enter to keep the current value ${this.configuration.widthOfTreadInMM} mm.`)
    if (Number.isInteger(parseInt(widthOfTreadInMM))) {
      this.configuration.widthOfTreadInMM = Number.isInteger(parseInt(widthOfTreadInMM))
    }

    const calibrateSpeed = await this.readLine(`Do you want to calibrate speed? y for yes other for n`)
    if (calibrateSpeed == 'y') {
      await this.calibrateSpeed(this.configuration)
    }
    await this.learnFrictionFactor()
    
    console.log(JSON.stringify(this.configuration, null, 2))

    const json = JSON.stringify(this.configuration, null, 2);
    fs.writeFileSync('./configuration.json', json)
  }

  async rotateDrone(angleInRadians, options) {
    console.log("rotate", angleInRadians)
    const { times = 1, pause = 0 } = options
    const { widthOfTankInMM, widthOfTreadInMM, speedForward, speedBackward } = this.configuration
    const direction = angleInRadians > 0 ? 'positive' : 'negative'
    const rotation = this.configuration.rotation[direction]
    let rotateFrictionFactor = 0
    let speedIncrease
    if (options.rotateFrictionFactor == null) {
      rotateFrictionFactor = this.calculateFrictionFactor(direction, angleInRadians)
      speedIncrease = rotation.speedIncrease
      if (this.debug) {
        console.log(`angleInRadians = ${angleInRadians}`)
        console.log(`direction = ${direction}`)
        console.log(`rotateFrictionFactor = ${rotateFrictionFactor}`)
        console.log(`speedIncrease = ${speedIncrease}`)
      }
    } else {
      rotateFrictionFactor = options.rotateFrictionFactor
      speedIncrease = options.speedIncrease
    }

    let t, speed
    const r = (widthOfTankInMM - widthOfTreadInMM)/1000
    const d = Math.abs(angleInRadians) * r
    const speedRotate = speedForward * (1 + (speedIncrease || 0)) // the drone needs to go faster to rotate
    t = d / speedRotate * (1 + rotateFrictionFactor)
    speed = speedRotate

    for (let i = 0; i < times; ++i ) {
      await this.stopDrone({ ...options, batched: true })
      await this.pauseDrone(0.25, { ...options, batched: true })
      if (angleInRadians < 0) { 
        await this.moveDrone(speed, -speed, { ...options, batched: true })
      } else {
        await this.moveDrone(-speed, speed, { ...options, batched: true })
      }
      await this.pauseDrone(t, { ...options, batched: true })
      await this.stopDrone({ ...options, batched: true })
      if (pause) {
        await this.pauseDrone(pause, { ...options, batched: true })
      }
    }
    await this.stopDrone(options)
  }

  async backwardDrone(speed, options) {
    await this.stopDrone(options)
    await this.pauseDrone(0.1, options)
    return await this.moveDrone(-speed, -speed, options)
  }

  // New: Sonic / Ultrasonic distance command
  // Returns the response (e.g. "Distance: 42 cm", "OK", or sensor value)
  async sonicDrone(options = {}) {
    const { samples = 3 } = options
    let total = 0
    let successes = 0
    while (successes < samples) {
      const response = await this.send('Sonic');   // ← change string if needed (e.g. 'Ultrasonic', 'GetDistance')
      console.log("sonic one", response)
      const match = response.match(/#([\d.]+)/);
      const number = match ? parseFloat(match[1]) : null;
      if (number) {
        total += number
        successes += 1
      }
    }
    return total/successes
  }

  async tiltAngleDrone(angle) {
  }

  async stopDrone(options) {
    return await this.processCommand('CMD_MOTOR#0#0#', options);
  }

  async startRepeatsDrone(n) {
    return await this.processCommand(`CMD_START_REPEATS#${n}#`, { batched: true });
  }

  async endRepeatsDrone(n) {
    return await this.processCommand(`CMD_END_REPEATS`, { batched: true });
  }

  async close() {
    if (this.socket) {
      return new Promise((resolve) => {
        this.socket.end(() => {
          this.connected = false;
          console.log('Tank connection closed');
          resolve();
        });
      });
    }
  }
}

// ────────────────────────────────────────────────
// Example usage (test script)
// ────────────────────────────────────────────────
async function test() {
  const tank = new TankClient('192.168.0.92', 5003);
  
  try {
    await tank.connect();

    if (false) {
      let percent = 20
      let distance = 0
      let moveTime = 500
      for (; percent < 30; ++percent) {
        const start = await tank.sonic();
        await tank.forwardDrone(percent)
        await sleep(moveTime)
        await tank.stop(percent)
        const end = await tank.sonic();
        if (end < start) {
          distance = start - end
          break;
        }
      }

      await tank.backward(percent)
      await sleep(moveTime)
      await tank.stop(percent)

      // console.log(`Distance ${distance} cm`)
      // console.log(`Time ${moveTime} ms`)
      const metersPerSecond = (distance/100)/(moveTime/1000)
      // console.log(`M/S ${metersPerSecond}`)

      if (false) {
        console.log(`Start percent is ${percent}`)

        const start = await tank.sonic();
        await tank.forwardDrone(20)
        await sleep(250)
        await tank.stop()
        const end = await tank.sonic();
      }
    }
    // while (true) {
    //   await tank.sonic()
    // }

    const calibration = JSON.parse(fs.readFileSync('./configuration.json'))
    const options = {
      ...calibration,
    }

    const args = process.argv.slice(2);
    if (args.includes("--configure") || args.includes("--calibrate")) {
      await tank.configureDrone()
      return
    }

    if (false) {
      while(true) {
        response = await tank.sonicDrone({ samples: 3 });
        console.log('Sonic response:', response*0.393701 || '(no reply)', 'inches');
        await sleep(500)
      }
    }
    if (true) {
      // await tank.configureDrone()
      await tank.rotateDrone(-Math.PI*2/4, { times: 1 })
      // await tank.sonicDrone({ times: 3 })
    }
    if (false) {
      await tank.learnFrictionFactor()
      console.log(JSON.stringify(tank.configuration, null, 2))
    }
    if (false) {
      // await tank.learnFrictionFactor({ ...options })
      tank.calculateRotateFormulas()
      const rotation = tank.configuration.rotation
      console.log(JSON.stringify(tank.configuration, null, 2))

      console.log(`f(${Math.PI*2/1}) == ${tank.calculateFrictionFactor('positive', Math.PI*2/1)} should be ${rotation.positive[1].frictionFactor}`)
      console.log(`f(${Math.PI*2/4}) == ${tank.calculateFrictionFactor('positive', Math.PI*2/4)} should be ${rotation.positive[4].frictionFactor}`)

      console.log(`f(${Math.PI*2/1}) == ${tank.calculateFrictionFactor('negative', Math.PI*2/1)} should be ${rotation.negative[1].frictionFactor}`)
      console.log(`f(${Math.PI*2/4}) == ${tank.calculateFrictionFactor('negative', Math.PI*2/4)} should be ${rotation.negative[4].frictionFactor}`)
      // await tank.learnFrictionFactorHelper('clockwise', 4, options)
      // await tank.learnFrictionFactorHelper('clockwise', 2, options)
      // await tank.learnFrictionFactorHelper('clockwise', 1, options)
    }
    if (false) {
      // await tank.moveDrone(-50, 50, { ...options, batched: true })
      for (let i = 0; i < 4; ++i ) {
        if (true) {
          await tank.moveDrone(80, -30, { ...options, batched: true })
          await tank.pauseDrone(1.0, { ...options, batched: true })
          await tank.stopDrone({ ...options })
          await tank.pauseDrone(1.0, { ...options, batched: true })
        }
        if (false) {
          await tank.moveDrone(-30, -30, { ...options, batched: true })
          await tank.pauseDrone(1.0, { ...options, batched: true })
          await tank.stopDrone({ ...options })
          await tank.pauseDrone(1.0, { ...options, batched: true })
        }
      }
    }
    if (false) {
      tank.send(`CMD_MULTI$CMD_MOTOR#1000#1000#$CMD_PAUSE#2000#$CMD_MOTOR#0#0#`);
    }
    if (false) {
      tank.send(`CMD_MOTOR#${power}#${power}#`);
      response = await tank.sonicDrone();
      console.log('Sonic response:', response || '(no reply)');
      response = await tank.forwardDrone(20);
      await sleep(500)
      response = await tank.stopDrone();
      response = await tank.sonicDrone();
      console.log('Sonic response:', response || '(no reply)');
    }
    if (false) {
      let response;
      debugger
      response = await tank.forwardDrone(15);
      console.log('Forward response:', response || '(no reply)');
      await sleep(1000)

      response = await tank.backward(20);
      console.log('Backward response:', response || '(no reply)');
      await sleep(1000)

      /*
      response = await tank.left(30);
      console.log('Left response:', response || '(no reply)');

      response = await tank.right(50);
      console.log('Right response:', response || '(no reply)');
      */

      response = await tank.stop();
      console.log('Stop response:', response || '(no reply)');

      response = await tank.sonic();
      console.log('Sonic response:', response || '(no reply)');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await tank.close();
  }
}

// Run the test if file executed directly
if (require.main === module) {
  test().catch(console.error)
}

module.exports = TankClient;
