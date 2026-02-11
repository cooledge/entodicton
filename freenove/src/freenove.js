const readline = require('readline');
const tpmkms = require('tpmkms');
const TankClient = require('./drone')
const fs = require('fs')
const WebSocket = require('ws');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const WIDTH_OF_TANK_IN_MM = 188;
const WIDTH_OF_TREAD_IN_MM = 44;
const DEBUG = true;

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
     
     minimumSpeedDrone() {
        return tank.minimumDroneSpeed()
      }

      maximumSpeedDrone() {
        return tank.maximumDroneSpeed()
      }

      async pauseDrone(durationInSeconds, options) {
        if (DEBUG) {
          console.log("pause", durationInSeconds)
        }
        // await sleep(durationInSeconds * 1000)
        await tank.pauseDrone(durationInSeconds, options)
      }

      async forwardDrone(speed, options) {
        if (DEBUG) {
          console.log("forward", speed, 'm/s')
        }
        await tank.moveDrone(speed, speed, options)
      }

      async backwardDrone(speed, options) {
        if (DEBUG) {
          console.log("backward", speed, 'm/s')
        }
        await tank.moveDrone(-speed, -speed, options)
      }

      async rotateDrone(angleInRadians, options = {}) {
        if (DEBUG) {
          console.log("rotate", angleInRadians)
        }
        await tank.rotateDrone(angleInRadians, options)
      }

      async sonicDrone() {
        if (DEBUG) {
          console.log("sonic")
        }
        return await tank.sonicDrone()
      }

      async tiltAngleDrone(options) {
        if (DEBUG) {
          console.log("tiltAngleDrone")
        }
        await tank.tiltAngleDrone(options)
      }

      async panAngleDrone(options) {
        if (DEBUG) {
          console.log("panAngleDrone")
        }
        await tank.panAngleDrone(options)
      }

      async stopDrone(options) {
        if (DEBUG) {
          console.log("stop")
        }
        await tank.stopDrone(options)
      }
    }

    return new API()
  }
  await drone.setApi(newAPI)

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '               // ← customize prompt if you want
  });

  console.log('Welcome to the interactive CLI');
  console.log('Type "help" for commands, "exit" to quit\n');
  console.log('Configure the drone by running "node drone" once to customize the parameters to your drone.\n');

  if (false) {
    // const response = await drone.query("around")
    const response = await drone.query("forward 2 feet\ngo back")
    // const response = await drone.query("forward")
    // const response = await drone.query("forward 1000 meters per second")
    // const response = await drone.query("forward 1 foot\ngo back")
    // const response = await drone.query("forward 1 foot\nbackward 1 foot")
    // const response = await drone.query("backward 1 foot")
    // const response = await drone.query("turn around")
    // const response = await drone.query("forward 6 inches")
    for (const log of response.logs) {
      if (log.includes("ERROR while applying")) {
        console.log(log)
      }
    }
    // console.log(JSON.stringify(response, null, 2))
    debugger
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

  const args = process.argv.slice(2);
  debugger
  if (args.includes("--voice")) {
    const wss = new WebSocket.Server({ port: 8765 });
    wss.on('connection', (ws) => {
      console.log('Python Vosk connected');

      ws.on('message', async (message) => {
        const text = message.toString().trim();
        if (text) {
          console.log('Received transcribed text:', text);
          const responses = await drone.query(text)
          const responseText = responses.responses.filter(str => str?.trim() !== "").join(" ")
          if (!!responseText) {
            console.log("sending response", responseText)
            ws.send(responseText)
          }
        }
      });

      ws.on('close', () => console.log('Python disconnected'));
    });
    console.log('WebSocket server running on ws://localhost:8765');
  } else {
    console.log('Running in console mode where the commands are types in. To use voice mode use the --voice arg. Start the voice input program ./src/voice/main.py after to send commands to the drone with voice')
    ask();
  }
})()


