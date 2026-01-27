// tank-client.js
const net = require('net');

// dear idiots who do node make a build in function with a memorable name for sleep instead of this monostrosity which i can never fucking remember

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const MAX_POWER = 4095;

function percentToPower(percent) {
  return percent * MAX_POWER / 100
}

class TankClient {
  constructor(host, port = 5003) {
    this.host = host;
    this.port = port;
    this.socket = null;
    this.connected = false;
    this.responseQueue = [];  // FIFO queue for incoming server messages
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
        console.log(`Tank server says: ${msg}`);
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
  async send(command, timeoutMs = 1500) {
    if (!this.connected || !this.socket) {
      throw new Error('Not connected');
    }

    // Optional: clear stale responses
    this.responseQueue = [];

    const fullCmd = command.trim() + '\n';

    return new Promise((resolve) => {
      this.socket.write(fullCmd, (err) => {
        if (err) {
          console.error('Write error:', err.message);
          resolve(null);
          return;
        }
        console.log(`Sent: ${fullCmd.trim()}`);
      });

      const start = Date.now();
      const interval = setInterval(() => {
        if (this.responseQueue.length > 0) {
          clearInterval(interval);
          resolve(this.responseQueue.shift());
        } else if (Date.now() - start > timeoutMs) {
          clearInterval(interval);
          resolve(null); // no response in time
        }
      }, 30); // check ~every 30ms
    });
  }

  // Movement methods – now return server response
  async forward(percentage = 50) {
    const power = percentToPower(percentage)
    return await this.send(`CMD_MOTOR#${power}#${power}#`);
  }

  async backward(percentage = 50) {
    const power = percentToPower(percentage)
    return await this.send(`CMD_MOTOR#${-power}#${-power}#`);
  }

  async left(power = 50) {
    return await this.send(`Left ${power}`);
  }

  async right(power = 50) {
    return await this.send(`Right ${power}`);
  }

  async stop() {
    return await this.send('CMD_MOTOR#0#0#');
  }

  // New: Sonic / Ultrasonic distance command
  // Returns the response (e.g. "Distance: 42 cm", "OK", or sensor value)
  async sonic() {
    const response = await this.send('Sonic');   // ← change string if needed (e.g. 'Ultrasonic', 'GetDistance')
    const match = response.match(/#([\d.]+)/);
    const number = match ? parseFloat(match[1]) : null;
    return number
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

    if (true) {
      let percent = 20
      let distance = 0
      let moveTime = 500
      for (; percent < 30; ++percent) {
        const start = await tank.sonic();
        await tank.forward(percent)
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

      console.log(`Distance ${distance} cm`)
      console.log(`Time ${moveTime} ms`)
      const metersPerSecond = (distance/100)/(moveTime/1000)
      console.log(`M/S ${metersPerSecond}`)

      if (false) {
        console.log(`Start percent is ${percent}`)

        const start = await tank.sonic();
        await tank.forward(20)
        await sleep(250)
        await tank.stop()
        const end = await tank.sonic();
      }
    }
    // while (true) {
    //   await tank.sonic()
    // }
    if (false) {
      let response;
      debugger
      response = await tank.forward(15);
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
    console.error('Error:', err.message);
  } finally {
    await tank.close();
  }
}

// Run the test if file executed directly
if (require.main === module) {
  test().catch(console.error);
}

module.exports = TankClient;
