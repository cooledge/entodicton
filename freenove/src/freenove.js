const readline = require('readline');
const tpmkms = require('tpmkms');
const TankClient = require('./drone')

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
      
      async pause(durationInSeconds) {
        console.log("pause", durationInSeconds)
        await sleep(durationInSeconds * 1000)
      }

      async forward(percentOfPower) {
        console.log("forward", percentOfPower)
        tank.forward(percentOfPower)
      }

      async stop() {
        console.log("stop")
        tank.stop()
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

  function ask() {
    rl.prompt();  // shows the prompt "> "

    rl.question('', async (input) => {   // empty string = use default prompt
      console.log("got input")
      const command = input.trim().toLowerCase();

      if (command === 'exit' || command === 'quit') {
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
