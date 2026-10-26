const puppeteer = require('puppeteer')
const tests = require('./tests.json')

// const URL = 'http://thinktelligence.com'
const URL = process.env.URL || 'http://localhost:10000'
const headless = process.env.HEADLESS !== 'false'
const sloMo = 25
const timeout = 60000

describe('tests for website', () => {
  let browser;
  beforeAll( async () => {
    browser = await puppeteer.launch({ headless, sloMo });
  }, timeout);
  afterAll( async () => {
    await browser.close()
  }, timeout);

  for (let t of tests) {
    test(`DEMO test ${t.query}`, async () => {
      const page = await browser.newPage();

      await page.goto(`${URL}/tankDemo`)
      await page.type('#query', t.query)
      await page.click('#submit')

      await page.waitForSelector('.response')
      const responses = await page.$('.response');
      const content = await page.content()
      for (let e of t.expected) {
        const message = `Did not find '${e}' on the page`
        expect(content.includes(e.toLowerCase()) ? message : '').toBe(message)
      }
      await page.close()
    }, timeout);
  }

  const exampleChecks = [
    'angle', 'asking', 'avatar', 'can', 'comparable'
  ]

  for (let t of exampleChecks) {
    test(`NEO23 DEMO make sure examples are not empty for '${t}'`, async () => {
      const page = await browser.newPage();
      await page.goto(`${URL}/kms`)

      // Click the angle element (this should expand / reveal the content underneath)
      await page.click(`[data-testid="${t}text"]`);

      // Wait for the kmUtterances sections to appear
      await page.waitForSelector('.kmUtterances', { visible: true });

      // Get all list items under any .kmUtterances (handles empty lists)
      const listItems = await page.$$eval(
        '.kmUtterances ul li',
        (elements) => elements.map(el => el.textContent.trim())
      );

      console.log('List items:', listItems);
      expect(listItems.length).not.toBe(0)
      // listItems will be [] if the list(s) are empty

      // Optional: get lists grouped by section (Sample utterances / Initial Knowledge / etc.)
      const sections = await page.$$eval('.kmUtterances', (divs) => {
        return divs.map(div => {
          const heading = div.querySelector('h4')?.textContent.trim() || null;
          const items = Array.from(div.querySelectorAll('ul li')).map(li => li.textContent.trim());
          return { heading, items }; // items will be [] when empty
        });
      });

      console.log('Sections:', JSON.stringify(sections, null, 2));

      await page.close();
    }, timeout);
  }
});
