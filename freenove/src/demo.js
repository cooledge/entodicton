// tank-robot-client.js
// Node.js client to demo all common Freenove Tank Robot API/control commands
// Run with: node tank-robot-client.js
// Requires: npm install net readline

const net = require('net');
const readline = require('readline');

// === CONFIG ===
const HOST = '192.168.0.92';      // ← CHANGE TO YOUR RASPBERRY PI IP (run hostname -I on Pi)
const PORT = 5003;                  // Common Freenove server port; confirm in server terminal

// Common Freenove command prefixes (based on their kits)
const COMMANDS = {
  MOTOR: 'CMD_MOTOR',               // #direction#speed#
  SPEED: 'CMD_SPEED',               // #leftSpeed#rightSpeed#  (often -1.0 to 1.0 or 0-100)
  LED: 'CMD_LED',                   // #r#g#b#  or #index#r#g#b#
  LED_MOD: 'CMD_LED_MOD',           // #mode# (0=off, 1=breathing, 2=chasing, etc.)
  BUZZER: 'CMD_BUZZER',             // #freq#duration_ms#
  SONIC: 'CMD_SONIC',               // Request ultrasonic distance (server may reply)
  HEAD: 'CMD_HEAD',                 // #servoId#angle#  (e.g. camera pan/tilt)
  SERVO: 'CMD_SERVO',               // For grabber arm or other servos
  COLOR: 'CMD_COLOR',               // #enable# (color tracking toggle)
  FACE: 'CMD_FACE',                 // #enable# (face detection toggle)
  STOP: 'CMD_STOP'                  // Emergency/all stop
};

// Create TCP client
const client = new net.Socket();

// Connect
client.connect(PORT, HOST, () => {
  console.log(`Connected to Tank Robot server at ${HOST}:${PORT}`);
  console.log('Type commands below (or use predefined demo). Type "help" for list.\n');
});

// Receive data (server may send ultrasonic responses, status, etc.)
client.on('data', (data) => {
  console.log(`Server reply: ${data.toString().trim()}`);
});

// Error handling
client.on('error', (err) => {
  console.error('Connection error:', err.message);
});

client.on('close', () => {
  console.log('Connection closed.');
  process.exit(0);
});

// Interactive CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

rl.prompt();

rl.on('line', (line) => {
  const input = line.trim().toUpperCase();

  if (input === 'HELP' || input === '?') {
    showHelp();
  } else if (input === 'DEMO') {
    runDemo();
  } else if (input === 'QUIT' || input === 'EXIT') {
    client.end();
  } else if (input) {
    // Send raw command if custom, or map to known
    sendCommand(input);
  }

  rl.prompt();
});

// Show available commands
function showHelp() {
  console.log('\nAvailable demo commands:');
  console.log('  forward       - Move forward');
  console.log('  backward      - Move backward');
  console.log('  left          - Turn left');
  console.log('  right         - Turn right');
  console.log('  stop          - Stop motors');
  console.log('  speed 80      - Set speed (0-100)');
  console.log('  led on        - LEDs on (white)');
  console.log('  led off       - LEDs off');
  console.log('  buzzer 1000 500 - Beep at 1000Hz for 500ms');
  console.log('  sonic         - Request distance');
  console.log('  head 0 90     - Set servo 0 (pan?) to 90°');
  console.log('  demo          - Run full sequence demo');
  console.log('  quit          - Exit');
  console.log('\nOr type any CMD_XXX#params# directly.\n');
}

// Send a command (append \n)
function sendCommand(cmd) {
  if (!cmd.endsWith('\n')) cmd += '\n';
  client.write(cmd);
  console.log(`Sent: ${cmd.trim()}`);
}

// Predefined friendly commands
const commandMap = {
  forward:  () => sendCommand(`${COMMANDS.MOTOR}#1000#1000#`),
  backward: () => sendCommand(`${COMMANDS.MOTOR}#-1000#-1000#`),
  left:     () => sendCommand(`${COMMANDS.MOTOR}#0#-1#`),
  right:    () => sendCommand(`${COMMANDS.MOTOR}#0#1#`),
  // stop:     () => sendCommand(`${COMMANDS.MOTOR}#0#0#`) || sendCommand(`${COMMANDS.STOP}#`),
  stop:     () => sendCommand(`${COMMANDS.MOTOR}#0#0#`),
  speed:    (arg) => sendCommand(`${COMMANDS.SPEED}#${arg || 80}#${arg || 80}#`),
  led:      (arg) => {
    if (arg === 'on') sendCommand(`${COMMANDS.LED}#255#255#255#`);
    else if (arg === 'off') sendCommand(`${COMMANDS.LED}#0#0#0#`);
    else sendCommand(`${COMMANDS.LED_MOD}#${arg || 1}#`);
  },
  buzzer:   (arg) => {
    const [freq, dur] = arg ? arg.split(' ') : ['1000', '300'];
    sendCommand(`${COMMANDS.BUZZER}#${freq}#${dur}#`);
  },
  sonic:    () => sendCommand(`${COMMANDS.SONIC}#`),
  head:     (arg) => {
    const [id, angle] = arg ? arg.split(' ') : ['0', '90'];
    sendCommand(`${COMMANDS.HEAD}#${id}#${angle}#`);
  }
};

// Full demo sequence
function runDemo() {
  console.log('\nRunning full demo sequence...\n');

  let step = 0;
  const interval = setInterval(() => {
    switch (step) {
      case 0: commandMap.forward(); break;
      case 1: commandMap.speed(60); break;
      case 2: commandMap.led('on'); break;
      case 3: commandMap.buzzer(); break;
      case 4: commandMap.left(); break;
      case 5: commandMap.right(); break;
      case 6: commandMap.backward(); break;
      case 7: commandMap.sonic(); break;
      case 8: commandMap.head('0 45'); break;
      case 9: commandMap.head('0 135'); break;
      case 10: commandMap.stop(); commandMap.led('off'); console.log('Demo complete!'); clearInterval(interval); break;
    }
    step++;
  }, 1500);  // 1.5s per step
}

// Handle direct input like "forward" or "led on"
rl.on('line', (line) => {
  const parts = line.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const arg = parts.slice(1).join(' ');

  if (commandMap[cmd]) {
    commandMap[cmd](arg);
  } else {
    // Fallback: send as-is
    sendCommand(line.trim());
  }
  rl.prompt();
});

console.log('Freenove Tank Robot Control Demo');
console.log(`Connecting to ${HOST}:${PORT} ...`);
console.log('Type "help" for commands or "demo" to run sequence.\n');
