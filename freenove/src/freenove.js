const originalLog = console.log;
console.log = function (...args) {
  const message = args.join(' ');

  if (message.includes('see the semantic property')) {   // ← change this
    console.trace('🔍 Found log call:');         // shows full stack trace
    console.log = originalLog; // restore after finding
  }

  originalLog.apply(console, args);
};

const readline = require('readline');
const tpmkms = require('tpmkms');
const TankClient = require('./drone')
const fs = require('fs')
const WebSocket = require('ws');
const { inspect } = require('util');

process.on('unhandledRejection', (reason, promise) => {
  console.error('=== UNHANDLED PROMISE REJECTION23 ===');

  console.error('Reason:');
  console.dir(reason, { depth: null, colors: true });   // Best for objects

  // Alternative / additional options:
  // console.error(inspect(reason, { depth: null, colors: true }));
  // console.error(JSON.stringify(reason, null, 2));

  if (reason instanceof Error) {
    console.error('Stack:', reason.stack);
  }

  console.error('Promise:', promise);
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const WIDTH_OF_TANK_IN_MM = 188;
const WIDTH_OF_TREAD_IN_MM = 44;
const DEBUG = true;

(async () => {
  const drone = await tpmkms.drone()
  if (process.env.GREG) {
    drone.server('http://localhost:3000', '6804954f-e56d-471f-bbb8-08e3c54d9321')
  }
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

      async messageDrone(message) {
        console.log('message:', message)
      }

      async armActionDrone(action, options) {
        if (DEBUG) {
          console.log("armAction", action)
        }
        await tank.armActionDrone(action, options)
      }

      async clawActionDrone(action, options) {
        if (DEBUG) {
          console.log("clawAction", action)
        }
        await tank.clawActionDrone(action, options)
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

      async startRepeatsDrone(n) {
        if (DEBUG) {
          console.log("startRepeats")
        }
        return await tank.startRepeatsDrone(n)
      }

      async endRepeatsDrone() {
        if (DEBUG) {
          console.log("endRepeats")
        }
        return await tank.endRepeatsDrone()
      }

      async sendBatchDrone() {
        if (DEBUG) {
          console.log("sendBatch")
        }
        return await tank.sendBatchDrone()
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
    const response = await drone.query("patrol dude")
    // const response = await drone.query("forward 1 foot\ngo back and forth 2 times")
    // const response = await drone.query("what is the speed").catch(e => console.error(e))
    // const response = await drone.query("lower the arm").catch(e => console.error(e))
    // console.log(response)
    // const response = await drone.query("forward 1000 meters per second")
    // const response = await drone.query("forward 1 foot\ngo back")
    // const response = await drone.query("forward 1 foot\nbackward 1 foot")
    // const response = await drone.query("backward 1 foot")
    // const response = await drone.query("turn around")
    // const response = await drone.query("forward 6 inches")
    if (false) {
      for (const log of response.logs) {
        if (log.includes("ERROR while applying")) {
          console.log(log)
        }
      }
    }
    // console.log(JSON.stringify(response, null, 2))
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
        const result = await drone.query(command)
        fs.writeFileSync('./dude.json', JSON.stringify(result, 0, 2))
        for (let i = 0; i < result.contexts.length; ++i) {
          const context = result.contexts[i]
          const response = result.responses[i]
          if (context.marker !== 'error') {
            console.log(response)
          }
        }
        // console.log(`Unknown command: "${command}"`);
        // console.log('Type "help" for available commands');
      }

      // Keep looping
      ask();
    });
  }

  const args = process.argv.slice(2);
  if (args.includes("--voice")) {
    console.log('Running in voice mode. Start the voice input program "python ./src/voice/main.py" after to send commands to the drone with voice')
    const wss = new WebSocket.Server({ port: 8765 });
    wss.on('connection', (ws) => {
      console.log('Python Vosk connected');

      ws.on('message', async (message) => {
        const text = message.toString().trim();
        if (text) {
          try {
            console.log('Received transcribed text:', text);
            const responses = await drone.query(text)
            let responseText = ''
            for (let i = 0; i < responses.contexts.length; ++i) {
              const context = responses.contexts[i]
              const response = responses.responses[i]
              if (context.marker !== 'error') {
                responseText += response
              }
            }
            if (!!responseText) {
              console.log("sending response", responseText)
              ws.send(responseText)
            }
          } catch( e ) {
            console.log("error processing request")
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


