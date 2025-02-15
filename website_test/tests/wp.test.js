const puppeteer = require('puppeteer')
const tests = require('./tests.json')
const character = require('../../pipboy/src/character.json')

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

const isAllTextTagged = async (page, tagName, condition = {comparison: 'all'}) => {
  // this was not working so I passed in data as the condition
  // await page.exposeFunction("condition", condition);
  const result = await page.evaluate(async (tagName, condition) => {
    const editor = document.querySelector('.slate-editor');
    if (!editor) return false;

    const textNodes = editor.querySelectorAll('span[data-slate-string="true"]');

    let counter = 0
    for (let node of textNodes) {
      // Check if the node is empty or only contains whitespace
      const textContent = node.textContent.trim();
      if (textContent === '') {
        continue; // Skip empty or whitespace-only nodes
      }

      const { comparison, letters } = condition
      let test = () => true
      if (comparison == 'prefix') {
        test = (word) => word.toLowerCase().startsWith(letters)
      }
      else if (comparison == 'suffix') {
        test = (word) => word.toLowerCase().endsWith(letters)
      }
      else if (comparison == 'include') {
        test = (word) => word.toLowerCase().includes(letters)
      }

      if (!test(textContent)) {
        console.log('rejecting', textContent)
        continue
      }

      console.log('checking ', textContent)
      console.log(node)
      // Check if the node is inside a <tag>
      if (node.tagName.toLowerCase() !== tagName) {
        let isTagged = false;
        let current = node;
        while (current && current !== editor) {
          console.log('current.tagName', current.tagName)
          if (current.tagName.toLowerCase() === tagName) {
            isTagged = true;
            break;
          }
          current = current.parentNode;
        }
        if (!isTagged) {
          debugger
          console.log('checking ', textContent)
          console.log('checking node', node)
          return false;
        }
      }
    }
    return true;
  }, tagName, condition);
  // await page.removeExposedFunction('condition');
  return result
}

describe('tests for wp page', () => {

  let counter
  let page
  let browser;

  beforeAll( async () => {
    browser = await puppeteer.launch({ headless, sloMo });
  }, timeout);

  afterAll( async () => {
    await browser.close()
  }, timeout);

  beforeEach( async () => {
    counter = 0
    page = await browser.newPage();
    await page.goto(`${URL}/wp/`)
    await page.waitForSelector('#query')
  }, timeout)

  afterEach( async () => {
    await page.close()
  }, timeout)

  test(`WP test page loads`, async () => {
    await page.waitForSelector('#query')
  }, timeout);

  const query = async (query) => { 
    await page.waitForSelector('#query')
    await page.type('#query', query)
    await page.click('#submit')
    await page.waitForSelector(`#queryCounter${counter+1}`)
    counter += 1
  }

  test(`WP make everything bold`, async () => {
    await query('make everything bold')
    expect(await isAllTextTagged(page, 'strong')).toBeTruthy()
  }, timeout);

  test(`WP make everything underlined`, async () => {
    await query('make everything underlined')
    expect(await isAllTextTagged(page, 'u')).toBeTruthy()
  }, timeout);

  test(`WP make everything italics`, async () => {
    await query('make everything italics')
    expect(await isAllTextTagged(page, 'em')).toBeTruthy()
  }, timeout);

  test(`WP make everything italics and underlined`, async () => {
    await query('make everything italics and underlined')
    expect(await isAllTextTagged(page, 'em')).toBeTruthy()
    expect(await isAllTextTagged(page, 'u')).toBeTruthy()
  }, timeout);

  test(`WP make everything italics underlined and bold`, async () => {
    await query('make everything italics underlined and bold')
    expect(await isAllTextTagged(page, 'em')).toBeTruthy()
    expect(await isAllTextTagged(page, 'u')).toBeTruthy()
    expect(await isAllTextTagged(page, 'strong')).toBeTruthy()
  }, timeout);

  test(`WP bold everything`, async () => {
    await query('bold everything')
    expect(await isAllTextTagged(page, 'strong')).toBeTruthy()
  }, timeout);

  test(`WP bold and underline everything`, async () => {
    await query('bold and underline everything')
    expect(await isAllTextTagged(page, 'strong')).toBeTruthy()
    expect(await isAllTextTagged(page, 'u')).toBeTruthy()
  }, timeout);

  test(`WP bold italicize and underline everything`, async () => {
    await query('bold italicize and underline everything')
    expect(await isAllTextTagged(page, 'strong')).toBeTruthy()
    expect(await isAllTextTagged(page, 'u')).toBeTruthy()
    expect(await isAllTextTagged(page, 'em')).toBeTruthy()
  }, timeout);

  test(`WP capitalize everything`, async () => {
    await query('capitalize everything')
    expect(await isAllTextTagged(page, 'uppercase')).toBeTruthy()
  }, timeout);

  test(`WP lowercase everything`, async () => {
    await query('lowercase everything')
    expect(await isAllTextTagged(page, 'lowercase')).toBeTruthy()
  }, timeout);

  test(`WP bold the words that start with t`, async () => {
    await query('bold the words that start with t')
    const condition = { comparison: 'prefix', letters: 't' }
    expect(await isAllTextTagged(page, 'strong', condition)).toBeTruthy()
  }, timeout);

  test(`WP bold the words that end with e`, async () => {
    await query('bold the words that end with e')
    const condition = { comparison: 'suffix', letters: 'e' }
    expect(await isAllTextTagged(page, 'strong', condition)).toBeTruthy()
  }, timeout);

  test(`WP make the words that start with t bold`, async () => {
    await query('make the words that start with t bold')
    const condition = { comparison: 'prefix', letters: 't' }
    expect(await isAllTextTagged(page, 'strong', condition)).toBeTruthy()
  }, timeout);

  test(`WP make the words that end with e bold`, async () => {
    await query('make the words that end with e bold')
    const condition = { comparison: 'suffix', letters: 'e' }
    expect(await isAllTextTagged(page, 'strong', condition)).toBeTruthy()
  }, timeout);

  test(`WP make the words that contain e bold`, async () => {
    await query('make the words that contain e bold')
    const condition = { comparison: 'include', letters: 'e' }
    expect(await isAllTextTagged(page, 'strong', condition)).toBeTruthy()
  }, timeout);

  test(`NEO23 WP underlin the words that contain e`, async () => {
    await query('underline the words that contain e')
    const condition = { comparison: 'include', letters: 'e' }
    expect(await isAllTextTagged(page, 'u', condition)).toBeTruthy()
  }, timeout);


});
