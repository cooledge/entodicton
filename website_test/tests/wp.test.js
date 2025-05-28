const puppeteer = require('puppeteer')
const tests = require('./tests.json')
const character = require('../../pipboy/src/character.json')
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

// this one takes text node to check
const isAllTextTaggedEasy = async (page, tagName, textNodeOrdinals) => {
  const result = await page.evaluate(async (tagName, textNodeOrdinals) => {
    const editor = document.querySelector('.slate-editor');
    if (!editor) return false;

    const textNodes = editor.querySelectorAll('span[data-slate-string="true"]');
    let textNodeOrdinal = 0
    for (let node of textNodes) {
      textNodeOrdinal += 1

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

      if (textNodeOrdinals.includes(textNodeOrdinal)) {
        return hasTag(node, tagName)
      }
    }
    return true;
  }, tagName, textNodeOrdinals);
  return result
}

const demoWriter = new DemoWriter('../wp/src/demo.json')

describe('tests for wp page', () => {

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
    demoWriter.add(query)
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

  test(`WP bold the second paragraph`, async () => {
    await query('bold the second paragraph')
    const conditions = [{ paragraphOrdinals: [2]}]
    expect(await isAllTextTagged(page, 'strong', conditions)).toBeTruthy()
  }, timeout);

  test(`WP underlined the paragraphs that contain bolded words`, async () => {
    await query('underlined the paragraphs that contain bolded words')
    const conditions = [{ paragraphOrdinals: [1, 2]}]
    expect(await isAllTextTagged(page, 'u', conditions)).toBeTruthy()
  }, timeout);

  test(`WP underlined the paragraphs that contains words that start with mid`, async () => {
    await query('underlined the paragraphs that contains words that start with mid')
    const conditions = [{ paragraphOrdinals: [2]}]
    expect(await isAllTextTagged(page, 'u', conditions)).toBeTruthy()
  }, timeout);

  test(`WP capitalize the first word of every paragraph`, async () => {
    await query('capitalize the first word of every paragraph')
    const conditions = [{ paragraphOrdinals: [1,2,3,4], wordOrdinals: [1]}]
    expect(await isAllTextTagged(page, 'uppercase', conditions)).toBeTruthy()
  }, timeout);

  test(`WP capitalize the first and second word of every paragraph`, async () => {
    await query('capitalize the first and second word of every paragraph')
    const conditions = [{ paragraphOrdinals: [1,2,3,4], wordOrdinals: [1, 2]}]
    expect(await isAllTextTagged(page, 'uppercase', conditions)).toBeTruthy()
  }, timeout);

  test(`WP bold the first word of every paragraph`, async () => {
    await query('bold the first word of every paragraph')
    const conditions = [{ paragraphOrdinals: [1,2,3,4], wordOrdinals: [1]}]
    expect(await isAllTextTagged(page, 'strong', conditions)).toBeTruthy()
  }, timeout);

  test(`WP bold the first word of the second paragraph`, async () => {
    await query('bold the first word of the second paragraph')
    const conditions = [{ paragraphOrdinals: [2], wordOrdinals: [1]}]
    expect(await isAllTextTagged(page, 'strong', conditions)).toBeTruthy()
  }, timeout);

  test(`WP bold the first word of the second and third paragraph`, async () => {
    await query('bold the first word of the second and third paragraph')
    const conditions = [{ paragraphOrdinals: [2,3], wordOrdinals: [1]}]
    expect(await isAllTextTagged(page, 'strong', conditions)).toBeTruthy()
  }, timeout);

  test(`WP bold the paragraph that contains words that start with t`, async () => {
    await query('bold the paragraph that contains words that start with t')
    const conditions = [{ paragraphOrdinals: [1,2,5]}]
    expect(await isAllTextTagged(page, 'strong', conditions)).toBeTruthy()
  }, timeout);

  test(`WP underline the paragraph that contains bolded words`, async () => {
    await query('underline the paragraph that contains bolded words')
    const conditions = [{ paragraphOrdinals: [1,2]}]
    expect(await isAllTextTagged(page, 'u', conditions)).toBeTruthy()
  }, timeout);

  test(`WP bold the second letter`, async () => {
    await query('bold the second letter')
    const textNodeOrdinals = [2]
    expect(await isAllTextTaggedEasy(page, 'strong', textNodeOrdinals)).toBeTruthy()
  }, timeout);

  test(`WP bold the second letter of the third word`, async () => {
    await query('bold the second letter of the third word')
    const textNodeOrdinals = [2]
    expect(await isAllTextTaggedEasy(page, 'strong', textNodeOrdinals)).toBeTruthy()
  }, timeout);

  test(`WP underline the first letter of the bolded words`, async () => {
    await query('underline the first letter of the bolded words')
    const textNodeOrdinals = [2, 10]
    expect(await isAllTextTaggedEasy(page, 'u', textNodeOrdinals)).toBeTruthy()
  }, timeout);

  test(`WP capitalize the first letter of every word`, async () => {
    await query('capitalize the first letter of every word')
    const textNodeOrdinals = [1, 3, 5, 7, 10, 14, 16, 18,
                              23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49, 51, 55, 57, 59, 61, 63, 65, 67, 69, 71, 73, 75, 77, 79, 81,
                              83, 85,
                              87, 89, 91, 
                              93, 95, 97, 99, 101]
    expect(await isAllTextTaggedEasy(page, 'uppercase', textNodeOrdinals)).toBeTruthy()
  }, timeout);

  test(`WP bold the third letter of the second paragraph`, async () => {
    await query('bold the third letter of the second paragraph')
    const textNodeOrdinals = [10]
    expect(await isAllTextTaggedEasy(page, 'strong', textNodeOrdinals)).toBeTruthy()
  }, timeout);

  test(`WP bold the first letter of every word that starts with t`, async () => {
    await query('bold the first letter of every word that starts with t')
    const textNodeOrdinals = [1, 5, 10, 15, 17, 19, 21, 25, 27, 29, 32]
    expect(await isAllTextTaggedEasy(page, 'strong', textNodeOrdinals)).toBeTruthy()
  }, timeout);

  test(`WP underline the bolded words in the second paragraph`, async () => {
    await query('underline the bolded words in the second paragraph')
    const textNodeOrdinals = [10]
    expect(await isAllTextTaggedEasy(page, 'u', textNodeOrdinals)).toBeTruthy()
  }, timeout);

  test(`WP bold the words that start with t in the second paragraph`, async () => {
    await query('bold the words that start with t in the second paragraph')
    const textNodeOrdinals = [10, 12, 14, 16, 20, 22, 24]
    expect(await isAllTextTaggedEasy(page, 'strong', textNodeOrdinals)).toBeTruthy()
  }, timeout);

  test(`WP bold the first letter of the words that start with t in the second paragraph`, async () => {
    await query('bold the first letter of the words that start with t in the second paragraph')
    const textNodeOrdinals = [10, 12, 14, 16, 20, 22, 24]
    expect(await isAllTextTaggedEasy(page, 'strong', textNodeOrdinals)).toBeTruthy()
  }, timeout);

  test(`WP in the second paragraph bold the first word`, async () => {
    await query('in the second paragraph bold the first word')
    const conditions = [{ paragraphOrdinals: [2], wordOrdinals: [1]}]
    expect(await isAllTextTagged(page, 'strong', conditions)).toBeTruthy()
  }, timeout);

  test(`WP in the second paragraph bold the first letter of the words that start with t`, async () => {
    await query('in the second paragraph bold the first letter of the words that start with t')
    const textNodeOrdinals = [10, 12, 14, 16, 20, 22, 24]
    expect(await isAllTextTaggedEasy(page, 'strong', textNodeOrdinals)).toBeTruthy()
  }, timeout);

  test(`WP underline the second bolded word`, async () => {
    await query('underline the second bolded word')
    const textNodeOrdinals = [10]
    expect(await isAllTextTaggedEasy(page, 'u', textNodeOrdinals)).toBeTruthy()
  }, timeout);

  test(`WP underline the first bolded word that starts with bo`, async () => {
    await query('underline the first bolded word that starts with bo')
    const textNodeOrdinals = [10]
    expect(await isAllTextTaggedEasy(page, 'u', textNodeOrdinals)).toBeTruthy()
  }, timeout);

  test(`WP bold the first three words`, async () => {
    await query('bold the first three words')
    // const textNodeOrdinals = [10]
    // expect(await isAllTextTaggedEasy(page, 'u', textNodeOrdinals)).toBeTruthy()
    const conditions = [{ paragraphOrdinals: [1], wordOrdinals: [1, 2, 3]}]
    expect(await isAllTextTagged(page, 'strong', conditions)).toBeTruthy()
  }, timeout);

  test(`WP bold the first three words that start with t`, async () => {
    await query('bold the first three words that start with t')
    const textNodeOrdinals = [1, 5, 10]
    expect(await isAllTextTaggedEasy(page, 'strong', textNodeOrdinals)).toBeTruthy()
  }, timeout);

  test(`WP in the first and second paragraph bold the second word`, async () => {
    await query('in the first and second paragraph bold the second word')
    const textNodeOrdinals = [2, 12]
    expect(await isAllTextTaggedEasy(page, 'strong', textNodeOrdinals)).toBeTruthy()
  }, timeout);

  test(`WP underline the first three bolded words`, async () => {
    await query('underline the first three bolded words')
    const textNodeOrdinals = [2, 10]
    expect(await isAllTextTaggedEasy(page, 'u', textNodeOrdinals)).toBeTruthy()
  }, timeout);

  test(`WP capitalize the first letter of the words that start with t`, async () => {
    await query('capitalize the first letter of the words that start with t')
    const textNodeOrdinals = [1, 8, 13, 15, 17, 19, 23, 25, 27, 30]
    expect(await isAllTextTaggedEasy(page, 'uppercase', textNodeOrdinals)).toBeTruthy()
  }, timeout);
});
