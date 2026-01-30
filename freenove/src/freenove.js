const readline = require('readline');
const tpmkms = require('tpmkms');
const TankClient = require('./drone')
const fs = require('fs')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const drone = await tpmkms.drone()
  const tank = new TankClient('192.168.0.92', 5003);
  await tank.connect();

  const newAPI = () => {
    class API extends drone.apiBase() {
      constructor() {
        super()
      }

      now() {
        return new Date()
      }
      
      async pauseDrone(durationInSeconds, options) {
        console.log("pause", durationInSeconds)
        // await sleep(durationInSeconds * 1000)
        await tank.pauseDrone(durationInSeconds, options)
      }

      async forwardDrone(percentOfPower, options) {
        console.log("forward", percentOfPower)
        await tank.forwardDrone(percentOfPower, options)
      }

      async backwardDrone(percentOfPower, options) {
        console.log("backward", percentOfPower)
        await tank.backwardDrone(percentOfPower, options)
      }

      async rotateDrone(angleInDegrees) {
        console.log("rotate", angleInDegrees)
        await tank.rotateDrone(angleInDegrees)
      }

      async sonicDrone() {
        console.log("sonic")
        return await tank.sonicDrone()
      }

      async tiltAngleDrone() {
        console.log("tiltAngleDrone")
        await tank.tiltAngleDrone()
      }

      async panAngleDrone() {
        console.log("panAngleDrone")
        await tank.panAngleDrone()
      }

      async stopDrone(options) {
        console.log("stop")
        await tank.stopDrone(options)
      }

      async saveCalibration(calibration) {
        const json = JSON.stringify(calibration, null, 2);
        fs.writeFileSync('./calibration.json', json)
      }
    }

    return new API()
  }
  await drone.setApi(newAPI)
  // const result = await drone.query("calibrate")
  // console.log(JSON.stringify(result, null, 2))
  // console.log(JSON.stringify(drone.config.objects, null, 2))

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '               // ← customize prompt if you want
  });

  console.log('Welcome to the interactive CLI');
  console.log('Type "help" for commands, "exit" to quit\n');

  try {
    const calibration = JSON.parse(fs.readFileSync('./calibration.json'))
    drone.api.loadCalibration(calibration)
    console.log("Loading previous configuration")
  } catch( e ) {
    console.log("Place an object about 50 cm in front of the drone. Then when ready say calibrate. The drone will calibrate itself")
  }

  if (false) {
    await drone.query("calibrate")
    // await drone.query("forward")
    return
  }
  function ask() {
    rl.prompt();  // shows the prompt "> "

    rl.question('', async (input) => {   // empty string = use default prompt
      console.log("got input")
      const command = input.trim().toLowerCase();

      if (['exit', 'quit'].includes(command)) {
        console.log('Goodbye!');
        rl.close();
        return;
      }
      if (command === 'help') {
        console.log('Available commands:');
        console.log('  help     → show this message');
        console.log('  echo <text> → repeat your text');
        console.log('  exit     → quit the program');
      } else if (command.startsWith('echo ')) {
        console.log('→ ' + command.slice(5));
      } else if (command) {
        await drone.query(command)
        // console.log(`Unknown command: "${command}"`);
        // console.log('Type "help" for available commands');
      }

      // Keep looping
      ask();
    });
  }

  ask();
})()
