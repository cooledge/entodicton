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

const isAllTextTagged = async (page, tagName, conditions = [{comparison: 'all'}]) => {
  // this was not working so I passed in data as the condition
  // await page.exposeFunction("condition", condition);
  // await sleep(10000)

  const result = await page.evaluate(async (tagName, conditions) => {
    const getTag = (node, tagName) => {
      if (node.tagName.toLowerCase() !== tagName) {
        let current = node;
        while (current && current !== editor) {
          if (current.tagName.toLowerCase() === tagName) {
            return current
          }
          current = current.parentNode;
        }
      }
    }

    const editor = document.querySelector('.slate-editor');
    if (!editor) return false;

    const textNodes = editor.querySelectorAll('span[data-slate-string="true"]');
    let counter = 0
    let wordOrdinal = 0
    let wordInParagraphOrdinal = 0
    let paragraphOrdinal = 0
    let lastParagraph;
    for (let node of textNodes) {
      // Check if the node is empty or only contains whitespace
      console.log(node)
      const textContent = node.textContent.trim();
      if (textContent === '') {
        continue; // Skip empty or whitespace-only nodes
      }
      const currentParagraph = getTag(node, 'p')
      const hasParagraph = !!currentParagraph
      console.log('currentParagraph', currentParagraph)
      if (currentParagraph && currentParagraph != lastParagraph) {
        paragraphOrdinal += 1
        wordInParagraphOrdinal = 0
        lastParagraph = currentParagraph
      }
      console.log('paragraphOrdinal', paragraphOrdinal)

      // ordinal range for current chunk
      const words = textContent.match(/\S+|\s+/g)
      const chunkOrdinals = []
      const chunkInParagraphOrdinals = []
      for (const word of words) {
        if (word.trim().length == 0) {
          continue
        }
        wordOrdinal += 1
        wordInParagraphOrdinal += 1
        chunkOrdinals.push(wordOrdinal)
        chunkInParagraphOrdinals.push(wordInParagraphOrdinal)
      }
      const hasTag = (node, tagName) => {
        // Check if the node is inside a <tag>
        if (node.tagName.toLowerCase() !== tagName) {
          let isTagged = false;
          let current = node;
          while (current && current !== editor) {
            console.log('current.tagName', current.tagName, current.id)
            if (current.tagName.toLowerCase() === tagName) {
              isTagged = true;
              break;
            }
            current = current.parentNode;
          }
          return isTagged
        }
      }

      console.log(`text: ${textContent} chunkOrdinals: ${chunkOrdinals}`)

      let pass = true
      for (const condition of conditions) {
        const { comparison, letters, hasStyle, wordOrdinals, wordInParagraphOrdinals, paragraphOrdinals } = condition
        const tests = []
        if (comparison == 'prefix') {
          tests.push(({ word }) => word.toLowerCase().startsWith(letters))
        } else if (comparison == 'suffix') {
          tests.push(({ word }) => word.toLowerCase().endsWith(letters))
        } else if (comparison == 'include') {
          tests.push(({ word }) => word.toLowerCase().includes(letters))
        } else if (hasStyle) {
          tests.push(({ word }) => hasTag(node, hasStyle))
        }

        if (wordInParagraphOrdinals) {
          tests.push(({ word, chunkInParagraphOrdinals }) => {
            let overlap = false
            for (const wordOrdinal of wordInParagraphOrdinals) {
              if (chunkInParagraphOrdinals.includes(wordOrdinal)) {
                overlap = true
                break
              }
            }
            return overlap
          })
        }

        if (wordOrdinals) {
          tests.push(({ word, chunkOrdinals }) => {
            let overlap = false
            for (const wordOrdinal of wordOrdinals) {
              if (chunkOrdinals.includes(wordOrdinal)) {
                overlap = true
                break
              }
            }
            return overlap
          })
        }
        
        if (paragraphOrdinals) {
          tests.push(({paragraphOrdinal}) => paragraphOrdinals.includes(paragraphOrdinal))
        }

        for (const test of tests) {
          if (!test({ word: textContent, chunkOrdinals, chunkInParagraphOrdinals, paragraphOrdinal })) {
            console.log('rejecting', textContent)
            pass = false
            break
          }
        }

        if (!pass) {
          break
        }
      }

      if (!pass) {
        continue
      }
 
      console.log('checking ', textContent)
      console.log(node)

      if (!hasTag(node, tagName)) {
        return false
      }
    }
    return true;
  }, tagName, conditions);
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
    expect(await isAllTextTagged(page, 'strong', [condition])).toBeTruthy()
  }, timeout);

  test(`WP bold the words that end with e`, async () => {
    await query('bold the words that end with e')
    const condition = { comparison: 'suffix', letters: 'e' }
    expect(await isAllTextTagged(page, 'strong', [condition])).toBeTruthy()
  }, timeout);

  test(`WP make the words that start with t bold`, async () => {
    await query('make the words that start with t bold')
    const condition = { comparison: 'prefix', letters: 't' }
    expect(await isAllTextTagged(page, 'strong', [condition])).toBeTruthy()
  }, timeout);

  test(`WP make the words that end with e bold`, async () => {
    await query('make the words that end with e bold')
    const condition = { comparison: 'suffix', letters: 'e' }
    expect(await isAllTextTagged(page, 'strong', [condition])).toBeTruthy()
  }, timeout);

  test(`WP make the words that contain e bold`, async () => {
    await query('make the words that contain e bold')
    const condition = { comparison: 'include', letters: 'e' }
    expect(await isAllTextTagged(page, 'strong', [condition])).toBeTruthy()
  }, timeout);

  test(`WP underline the words that contain e`, async () => {
    await query('underline the words that contain e')
    const condition = { comparison: 'include', letters: 'e' }
    expect(await isAllTextTagged(page, 'u', [condition])).toBeTruthy()
  }, timeout);

  test(`WP underline the bolded words`, async () => {
    await query(`underline the bolded words`)
    const condition = { hasStyle: 'strong' }
    expect(await isAllTextTagged(page, 'u', [condition])).toBeTruthy()
  }, timeout);

  test(`WP capitalize the bolded words`, async () => {
    await query(`capitalize the bolded words`)
    const condition = { hasStyle: 'strong' }
    expect(await isAllTextTagged(page, 'uppercase', [condition])).toBeTruthy()
  }, timeout);

  test(`WP italicize the bolded words`, async () => {
    await query(`italicize the bolded words`)
    const condition = { hasStyle: 'strong' }
    expect(await isAllTextTagged(page, 'em', [condition])).toBeTruthy()
  }, timeout);

  test(`WP bold the underlined words`, async () => {
    await query(`bold the underlined words`)
    const condition = { hasStyle: 'u' }
    expect(await isAllTextTagged(page, 'strong', [condition])).toBeTruthy()
  }, timeout);

  test(`WP capitalize the underlined words`, async () => {
    await query(`capitalize the underlined words`)
    const condition = { hasStyle: 'u' }
    expect(await isAllTextTagged(page, 'uppercase', [condition])).toBeTruthy()
  }, timeout);

  test(`WP italicize the underlined words`, async () => {
    await query(`italicize the underlined words`)
    const condition = { hasStyle: 'u' }
    expect(await isAllTextTagged(page, 'em', [condition])).toBeTruthy()
  }, timeout);

  test(`WP bold the capitalized words`, async () => {
    await query(`bold the capitalized words`)
    const condition = { hasStyle: 'uppercase' }
    expect(await isAllTextTagged(page, 'strong', [condition])).toBeTruthy()
  }, timeout);

  test(`WP underline the capitalized words`, async () => {
    await query(`underline the capitalized words`)
    const condition = { hasStyle: 'uppercase' }
    expect(await isAllTextTagged(page, 'u', [condition])).toBeTruthy()
  }, timeout);

  test(`WP italicize the capitalized words`, async () => {
    await query(`italicize the capitalized words`)
    const condition = { hasStyle: 'uppercase' }
    expect(await isAllTextTagged(page, 'em', [condition])).toBeTruthy()
  }, timeout);

  test(`WP bold the italicized words`, async () => {
    await query(`bold the italicized words`)
    const condition = { hasStyle: 'italic' }
    expect(await isAllTextTagged(page, 'strong', [condition])).toBeTruthy()
  }, timeout);

  test(`WP underline the italicized words`, async () => {
    await query(`underline the italicized words`)
    const condition = { hasStyle: 'italic' }
    expect(await isAllTextTagged(page, 'u', [condition])).toBeTruthy()
  }, timeout);

  test(`WP capitalize the italicized words`, async () => {
    await query(`capitalize the italicized words`)
    const condition = { hasStyle: 'italic' }
    expect(await isAllTextTagged(page, 'uppercase', [condition])).toBeTruthy()
  }, timeout);

  test(`WP underlined the bolded words that start with r`, async () => {
    await query('italicize the bolded words that start with r')
    const conditions = [{ hasStyle: 'strong' }, { comparison: 'prefix', letters: 'r' }]
    expect(await isAllTextTagged(page, 'em', conditions)).toBeTruthy()
  }, timeout);

  test(`WP bold the first word`, async () => {
    await query('bold the first word')
    const conditions = [{ wordOrdinals: [1] }]
    expect(await isAllTextTagged(page, 'strong', conditions)).toBeTruthy()
  }, timeout);

  test(`WP underline the 4th word`, async () => {
    await query('underline the 4th word')
    const conditions = [{ wordOrdinals: [4] }]
    expect(await isAllTextTagged(page, 'u', conditions)).toBeTruthy()
  }, timeout);

  test(`WP underline the 4th and 7th word`, async () => {
    await query('underline the 4th and 7th word')
    const conditions = [{ wordOrdinals: [4, 7] }]
    expect(await isAllTextTagged(page, 'u', conditions)).toBeTruthy()
  }, timeout);

  test(`WP underline the first word of the second paragraph`, async () => {
    await query('underline the first word of the second paragraph')
    const conditions = [{ paragraphOrdinals: [2], wordInParagraphOrdinals: [1] }]
    expect(await isAllTextTagged(page, 'u', conditions)).toBeTruthy()
  }, timeout);

  test(`NEO23 WP bold the second paragraph`, async () => {
    await query('bold the second paragraph')
    const conditions = [{ paragraphOrdinals: [2]}]
    expect(await isAllTextTagged(page, 'strong', conditions)).toBeTruthy()
  }, timeout);
});
