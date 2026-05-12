const puppeteer = require('puppeteer')
const tests = require('./tests.json')
const DemoWriter = require('./demoWriter')

// const URL = 'http://thinktelligence.com'
// const URL = 'https://thinktelligence.com:81' || process.env.URL || 'http://localhost:10000'
const URL = process.env.URL || 'http://localhost:10000'
const headless = process.env.HEADLESS !== 'false'
const sloMo = 750
const timeout = 60000

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const demoWriter = new DemoWriter('../drone/src/demo.json')

expect.extend({
  toBeCloseToPercent(received, expected, percentTolerance = 5) {
    if (typeof received !== 'number' || typeof expected !== 'number') {
      throw new TypeError('Both received and expected must be numbers');
    }

    if (expected === 0) {
      // Special case: avoid division by zero
      const pass = Math.abs(received) <= (percentTolerance / 100);
      return {
        pass,
        message: () => `expected ${received} to be within ${percentTolerance}% of 0`,
      };
    }

    const relativeDiff = Math.abs(received - expected) / Math.abs(expected) * 100;
    const pass = relativeDiff <= percentTolerance;

    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be within ${percentTolerance}% of ${expected}`
          : `expected ${received} to be within ${percentTolerance}% of ${expected}\n` +
            `Received difference: ${relativeDiff.toFixed(3)}%`,
    };
  },
});

function parsePosition(positionString) {
  const text = positionString.trim(); // e.g. "(6.0, 6.0)"

  // Parse "(6.0, 6.0)" into [6.0, 6.0]
  const match = text.match(/\(([\d.-]+),\s*([\d.-]+)\)/);

  if (match) {
    return {
      x: parseFloat(match[1]),
      y: parseFloat(match[2]),
      raw: text
    };
  }
  return null;
}

function parsePathPoints(text) {
  if (typeof text !== 'string') {
    throw new Error('Input must be a string');
  }

  const trimmed = text.trim();

  // Match all occurrences of (x, y) patterns
  const regex = /\(\s*([-+]?\d*\.?\d+)\s*,\s*([-+]?\d*\.?\d+)\s*\)/g;

  const points = [];
  let match;

  while ((match = regex.exec(trimmed)) !== null) {
    const x = parseFloat(match[1]);
    const y = parseFloat(match[2]);

    if (!isNaN(x) && !isNaN(y)) {
      points.push([x, y]);
    }
  }

  if (points.length === 0) {
    throw new Error(`No valid points found in: "${trimmed}"`);
  }

  return points;
}

describe('tests for drone page', () => {

  let counter
  let page
  let browser;

  beforeAll( async () => {
    browser = await puppeteer.launch({ headless, sloMo });
  }, timeout);

  afterAll( async () => {
    await browser.close()
    if (!process.env.NO_DEMOS) {
      demoWriter.write()
    }
  }, timeout);

  beforeEach( async () => {
    counter = 0
    page = await browser.newPage();
    await page.goto(`${URL}/drone/?unittest=true`)
    await page.waitForSelector('#query')
    demoWriter.startTest()
  }, timeout)

  afterEach( async () => {
    await page.close()
    demoWriter.endTest()
  }, timeout)

  const query = async (query) => {
    demoWriter.add(query)
    await page.waitForSelector('#query')
    await page.type('#query', query)
    await page.click('#submit')
    await page.waitForSelector(`#queryCounter${counter+1}`)
    counter += 1
  }

  async function testPosition(x, y, angle) {
    const positionText = await page.$eval('span.position', el => el.textContent.trim());
    const rotationText = await page.$eval('span.rotation', el => el.textContent.trim());
    const position = parsePosition(positionText)
    expect(position.x).toBeCloseToPercent(x, 15)
    expect(position.y).toBeCloseToPercent(y, 15)
    expect(rotationText).toBe(angle)
  }

  test(`DRONE test page loads`, async () => {
    await page.waitForSelector('#query')
  }, timeout);

  test(`DRONE forward 1 meter\nturn north\nforward 1 meter`, async () => {
    await query('forward 1 meter')
    await query('turn north')
    await query('forward 1 meter')
    await testPosition(6, 6, '90')
  }, timeout);

  test(`DRONE turn north\nforward 1 meter\nturn west\nforward 1 meter`, async () => {
    await query('turn north')
    await query('forward 1 meter')
    await query('turn west')
    await query('forward 1 meter')
    await testPosition(4, 6, '180')
  }, timeout);

  async function testPathDoesNotExist(name, expectedPathPoints, pathIndex=0) { 
    const element = await page.$(`span.pathName_${pathIndex}`);
    expect(element).toBeNull();
  }

  async function testPath(name, expectedPathPoints, pathIndex=0) { 
    const pathName = await page.$eval(`span.pathName_${pathIndex}`, el => el.textContent.trim());
    expect(pathName).toBe(name)
    const pathPointsText = await page.$eval(`span.pathPoints_${pathIndex}`, el => el.textContent.trim());
    const actualPathPoints = parsePathPoints(pathPointsText)
    for (let i = 0; i < expectedPathPoints.length; ++i) {
      expect(actualPathPoints[i][0]).toBeCloseToPercent(expectedPathPoints[i][0], 10)
      expect(actualPathPoints[i][1]).toBeCloseToPercent(expectedPathPoints[i][1], 10)
    }
  }

  test(`DRONE forward 1 meter\nturn north\nforward 1 meter`, async () => {
    await query('forward 1 meter')
    await query('turn north')
    await query('forward 1 meter')
    await query('call that path route 1')
    await testPosition(6, 6, '90')

    const expectedPathPoints = [[5, 5], [6, 5], [6, 6]]
    await testPath('route 1', expectedPathPoints)
  }, timeout);

  test(`DRONE forward 1 meter\nnorth 1 meter\ngo back`, async () => {
    await query('forward 1 meter')
    await query('north 1 meter')
    await query('go back')
    await testPosition(6, 5, '270')
  }, timeout);

  test(`DRONE forward 1 meter\ncall the path route 1\ngo back\npatrol route 1`, async () => {
    await query('forward 1 meter')
    await query('call the path route 1')
    await query('go back')
    await query('patrol route 1')
    const response = await page.$eval('span.response', el => el.textContent.trim());
    expect(response).toBe("patrol route 1")
    await testPosition(5, 5, '0')

    const expectedPathPoints = [[5, 5], [6, 5]]
    await testPath('route 1', expectedPathPoints)
  }, timeout);

  test(`DRONE forward 1 meter\nnorth 1 meter\ncall the path route 1\ngo to the start of route 1\npatrol route 1\npatrol route 1`, async () => {
    await query('forward 1 meter')
    await query('north 1 meter')
    await query('call the path route 1')
    await query('go to the start of route 1')
    await query('patrol route 1')
    await query('patrol route 1')
    await testPosition(5, 5, '0')

    const expectedPathPoints = [[5, 5], [6, 5], [6, 6]]
    await testPath('route 1', expectedPathPoints)
  }, timeout);

  test(`DRONE what is the speed of the drone`, async () => {
    await query('what is the speed of the drone')
    const response = await page.$eval('span.response', el => el.textContent.trim());
    expect(response).toBe("the speed of the drone is 5 meters per second")
  }, timeout);


  test(`DRONE forward 1 meter\nturn left 45 degrees\nforward 1 meter\nwest 2 meters\ncall that path route 66\ngo to the start of route 66\nsouth 1 meter\neast 1 meter\ncall the last three points path route 77`, async () => {
    await query('forward 1 meter')
    await query('turn left 45 degrees')
    await query('forward 1 meter')
    await query('west 2 meters')
    await query('call that path route 66')
    await query('go to the start of route 66')
    await query('south 1 meter')
    await query('east 1 meter')
    await query('call the last three points route 77')
    
    await testPosition(6, 4, '0')

    const expectedPathPoints0 = [[5, 5], [6, 5], [6.7, 5.7], [4.7, 5.7]]
    await testPath('route 66', expectedPathPoints0, 0)

    const expectedPathPoints1 = [[5, 5], [5, 4], [6, 4]]
    await testPath('route 77', expectedPathPoints1, 1)
  }, timeout);

  test(`DRONE forward 1 meter\ncall the path route 1\ngo back\ngo to the end of the path`, async () => {
    await query('forward 1 meter')
    await query('call the path route 1')
    await query('go back')
    await query('go to the end of the path')
    
    await testPosition(6, 5, '0')

    const expectedPathPoints = [[5, 5], [6, 5]]
    await testPath('route 1', expectedPathPoints, 0)
  }, timeout);

  test(`DRONE forward 1 meter\ncall that route 1`, async () => {
    await query('forward 1 meter')
    await query('call that route 1')
    
    await testPosition(6, 5, '0')

    const expectedPathPoints = [[5, 5], [6, 5]]
    await testPath('route 1', expectedPathPoints, 0)
  }, timeout);

  test(`DRONE forward 1 meter\nnorth 1 meter\ncall that route 1\ngo to the second point of route 1`, async () => {
    await query('forward 1 meter')
    await query('north 1 meter')
    await query('call that route 1')
    await query('go to the second point of route 1')
    
    await testPosition(6, 5, '270')

    const expectedPathPoints = [[5, 5], [6, 5], [6, 6]]
    await testPath('route 1', expectedPathPoints, 0)
  }, timeout);

  test(`DRONE forward 1 meter\nnorth 1 meter\ncall that route 1\npatrol route 1 pausing 1 second at each point`, async () => {
    await query('forward 1 meter')
    await query('north 1 meter')
    await query('call that route 1')
    await query('patrol route 1 pausing 1 second at each point')
    await sleep(6)
    
    await testPosition(5, 5, '0')

    const expectedPathPoints = [[5, 5], [6, 5], [6, 6]]
    await testPath('route 1', expectedPathPoints, 0)
  }, timeout);

  test(`DRONE forward 1 meter\nnorth 1 meter\ncall that route 1\npatrol route 1 pausing 1 second at the first and last points`, async () => {
    await query('forward 1 meter')
    await query('north 1 meter')
    await query('call that route 1')
    await query('patrol route 1 pausing 1 second at the first and last points')
    await sleep(6)
    
    await testPosition(5, 5, '0')

    const expectedPathPoints = [[5, 5], [6, 5], [6, 6]]
    await testPath('route 1', expectedPathPoints, 0)
  }, timeout);

  test(`DRONE forward 1 meter\nnorth 1 meter\ncall that route 1\npatrol route 1 pausing 1 second at the first and 5 seconds at the last point`, async () => {
    await query('forward 1 meter')
    await query('north 1 meter')
    await query('call that route 1')
    await query('patrol route 1 pausing 1 second at the first point and 3 seconds at the last point')
    await sleep(6)
    
    await testPosition(5, 5, '0')

    const expectedPathPoints = [[5, 5], [6, 5], [6, 6]]
    await testPath('route 1', expectedPathPoints, 0)
  }, timeout);

  test(`DRONE forward 1 meter\nnorth 1 meter\ncall that route 1\ngo to the start`, async () => {
    await query('forward 1 meter')
    await query('north 1 meter')
    await query('call that route 1')
    await query('go to the start')
    await sleep(6)
    
    await testPosition(5, 5, '225')

    const expectedPathPoints = [[5, 5], [6, 5], [6, 6]]
    await testPath('route 1', expectedPathPoints, 0)
  }, timeout);

  test(`DRONE go 1 meter then turn north`, async () => {
    await query('go 1 meter then turn north')
    await testPosition(6, 5, '90')
  }, timeout);

  test(`DRONE forward 1 meter\nnorth 1 meter\ncall that route 1\ngo to the start\ngo to the end`, async () => {
    await query('forward 1 meter')
    await query('north 1 meter')
    await query('call that route 1')
    await query('go to the start')
    await query('go to the end')
    await sleep(6)
    
    await testPosition(6, 6, '45')

    const expectedPathPoints = [[5, 5], [6, 5], [6, 6]]
    await testPath('route 1', expectedPathPoints, 0)
  }, timeout);

  test(`DRONE forward 1 meter\nnorth 1 meter\ncall that route 1\ngo to the start\nstart a path\nsouth 1 meter\nwest 1 meter\ncall that route 2\npatrol route 1\npatrol route 2`, async () => {
    await query('forward 1 meter')
    await query('north 1 meter')
    await query('call that route 1')
    await query('go to the start')
    await query('start a path')
    const response = await page.$eval('span.response', el => el.textContent.trim());
    expect(response).toBe("New path started from (5.00, 5.00)")
    await query('south 1 meter')
    await query('west 1 meter')
    await query('call that route 2')
    await query('patrol route 1')
    await query('patrol route 2')
    
    await testPosition(5, 5, '270')

    const expectedPathPoints = [[5, 5], [6, 5], [6, 6]]
    await testPath('route 1', expectedPathPoints, 0)
  }, timeout);

  test(`DRONE forward 1 meter\ncall that route 1\ngo to the start\nstart a path\nsouth 1 meter\ncall that route 2\npatrol route 1 then route 2`, async () => {
    await query('forward 1 meter')
    await query('call that route 1')
    await query('go to the start')
    await query('start a path')
    const response = await page.$eval('span.response', el => el.textContent.trim());
    expect(response).toBe("New path started from (5.00, 5.00)")
    await query('south 1 meter')
    await query('call that route 2')
    await query('patrol route 1 then route 2')

    await testPosition(5, 5, '270')

    await testPath('route 1', [[5, 5], [6, 5]], 0)
    await testPath('route 2', [[5, 5], [5, 4]], 1)
  }, timeout);

  test(`DRONE forward 1 meter\ncall that route 1\nforget route 1\npatrol route 1`, async () => {
    await query('forward 1 meter')
    await query('call that route 1')
    await query('forget route 1')
    await testPathDoesNotExist('route 1')

    await query('patrol route 1')
    const response = await page.$eval('span.response', el => el.textContent.trim());
    expect(response).toBe("route 1 is not a known path")

    await testPosition(6, 5, '0')

  }, timeout);

  test(`NEO23 DRONE forward 1 meter\nnorth 1 meter\nwest 1 meter\ncall that route 1\npatrol route 1 skipping the third point`, async () => {
    await query('forward 1 meter')
    await query('north 1 meter')
    await query('west 1 meter')
    await query('call that route 1')
    await query('patrol route 1 skipping the third point')
    const response = await page.$eval('span.response', el => el.textContent.trim());
    expect(response).toBe("patrol route 1 skipping the third point")

    await testPosition(5, 5, '0')

  }, timeout);
});
