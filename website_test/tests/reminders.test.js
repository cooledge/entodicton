const puppeteer = require('puppeteer')
const tests = require('./tests.json')
const DemoWriter = require('./demoWriter')

const URL = process.env.URL || 'http://localhost:10000'
const headless = process.env.HEADLESS !== 'false'
const sloMo = 750
const timeout = 60000

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const demoWriter = new DemoWriter('../reminders/src/demo.json')

describe('tests for reminders page', () => {

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
    await page.goto(`${URL}/reminders/`)
    await page.waitForSelector('#query')
    await page.click(`#testingButton`)
  }, timeout)

  afterEach( async () => {
    await page.close()
  }, timeout)

  const waitForClass = async (id, className) => {
    await page.waitForFunction(
      (id, className) => {
        const element = document.getElementById(id);
        return element && element.classList.contains(className);
      },
      { timeout: 30000 }, // Optional: timeout in milliseconds (default is 30 seconds)
      id,
      className 
    );
  }

  test(`REMINDERS test page loads`, async () => {
    await page.waitForSelector('#query')
  }, timeout);

  const addUser = async (name) => { 
    await page.type('#inputName', name)
    await page.click('#addNameButton')
  }

  const query = async (fullQuery) => { 
    demoWriter.add(fullQuery.toLowerCase().replace(/\n/g, "\\n"));
    const queries = fullQuery.split('\n')
    for (let query of queries) {
      await page.waitForSelector('#query')
      await page.type('#query', query)
      await page.click('#submit')
      await page.waitForSelector(`#queryCounter${counter+1}`)
      counter += 1
    }
  }

  const check_response = async (response) => {
    if (response) {
      const responseSpan = await page.$eval('.response', el => el.textContent);
      expect(responseSpan.trim()).toBe(response);
    } else {
      const responseElements = await page.$$('.response');
      expect(responseElements.length).toBe(0);
    }
  }

  const check = async ({id, details, who, when, next, highlighted}) => {
    if (!who) {
      who = 'me'
    }

    const reminderDiv = await page.$(`#reminder_${id}`);
    expect(reminderDiv).not.toBeNull(); // Ensure the div exists

    const divClass = await page.$eval(`#reminder_${id}`, el => el.className);
    if (highlighted) {
      expect(divClass).toBe('reminder highlighted');
    } else {
      expect(divClass).toBe('reminder');
    }

    const detailsSpan = await page.$eval(`#reminder_${id} .details`, el => el.textContent);
    expect(detailsSpan).toBe(details);

    const whoSpan = await page.$eval(`#reminder_${id} .who`, el => el.textContent);
    expect(whoSpan).toBe(who);

    const timeSpan = await page.$eval(`#reminder_${id} .time`, el => el.textContent);
    expect(timeSpan).toBe(when);

    const nextSpan = await page.$eval(`#reminder_${id} .next`, el => el.textContent);
    expect(nextSpan).toBe(next || '');

    const spans = await page.$$(`#reminder_${id} span`);
    expect(spans.length).toBe(4);
  }

  test(`NEOS23 REMINDERS remind me to go to regina`, async () => {
    await page.waitForSelector('#query')
    await query("remind me to go to regina")

    await check({
      id: 1,
      details: 'go to regina',
      when: '',
      highlighted: true,
    })
    await check_response('When should I remind you to go to regina')
  })

  test(`NEOS23 REMINDERS remind me to go to regina + monday`, async () => {
    await page.waitForSelector('#query')
    await query("remind me to go to regina\nmonday")

    await check({
      id: 1,
      details: 'go to regina',
      when: 'monday',
      next: '30/06/2025, 2:52:00 pm',
      highlighted: true,
    })
    await check_response(null)
  })

  test(`NEOS23 REMINDERS remind me to go to regina + remind me to go to saskatoon`, async () => {
    await page.waitForSelector('#query')
    await query("remind me to go to regina\nremind me to go to saskatoon")
    // await query("remind me to go to regina")
    // await query("remind me to go to saskatoon")

    await check({
      id: 1,
      details: 'go to regina',
      when: '',
      highlighted: false,
    })
    await check({
      id: 2,
      details: 'go to saskatoon',
      when: '',
      highlighted: true,
    })
    await check_response('When should I remind you to go to saskatoon')
  })

  test(`NEOS23 REMINDERS up 1`, async () => {
    await page.waitForSelector('#query')
    await query("remind me to go to regina\nremind me to go to saskatoon\nup 1")
    // await query("remind me to go to regina")
    // await query("remind me to go to saskatoon")

    await check({
      id: 1,
      details: 'go to regina',
      when: '',
      highlighted: true,
    })
    await check({
      id: 2,
      details: 'go to saskatoon',
      when: '',
      highlighted: false,
    })
    await check_response('When should I remind you to go to saskatoon')
  })

  test(`NEOS23 REMINDERS click`, async () => {
    await page.waitForSelector('#query')
    await query("remind me to go to regina\nremind me to go to saskatoon")
    await page.click(`#reminder_1`)
    // await query("remind me to go to regina")
    // await query("remind me to go to saskatoon")

    await check({
      id: 1,
      details: 'go to regina',
      when: '',
      highlighted: true,
    })
    await check({
      id: 2,
      details: 'go to saskatoon',
      when: '',
      highlighted: false,
    })
    await check_response('When should I remind you to go to saskatoon')
  })

  test(`NEOS23 REMINDERS remind me to go to regina on monday at 10 am`, async () => {
    await page.waitForSelector('#query')
    await query("remind me to go to regina on monday at 10 am")
    await page.click(`#reminder_1`)
    // await query("remind me to go to regina")
    // await query("remind me to go to saskatoon")

    await check({
      id: 1,
      details: 'go to regina',
      when: 'on monday at 10 am',
      next: "30/06/2025, 10:00:00 am",
      highlighted: true,
    })
    await check_response()
  })

  test(`NEOS23 REMINDERS up 2`, async () => {
    await page.waitForSelector('#query')
    await query("remind me to go to regina\nremind me to go to saskatoon\nremind me to go to moose jaw\nup 2")
    // await query("remind me to go to regina")
    // await query("remind me to go to saskatoon")

    await check({
      id: 1,
      details: 'go to regina',
      when: '',
      highlighted: true,
    })
    await check({
      id: 2,
      details: 'go to saskatoon',
      when: '',
      highlighted: false,
    })
    await check({
      id: 3,
      details: 'go to moose jaw',
      when: '',
      highlighted: false,
    })
    await check_response('When should I remind you to go to moose jaw')
  })

  test(`NEOS23 REMINDERS down 1`, async () => {
    await page.waitForSelector('#query')
    await query("remind me to go to regina\nremind me to go to saskatoon\nup 1\ndown 1")
    // await query("remind me to go to regina")
    // await query("remind me to go to saskatoon")

    await check({
      id: 1,
      details: 'go to regina',
      when: '',
      highlighted: false,
    })
    await check({
      id: 2,
      details: 'go to saskatoon',
      when: '',
      highlighted: true,
    })
    await check_response('When should I remind you to go to saskatoon')
  })

  test(`NEOS23 REMINDERS down 2`, async () => {
    await page.waitForSelector('#query')
    await query("remind me to go to regina\nremind me to go to saskatoon\nremind me to go to moose jaw\nup 2\ndown 2")

    await check({
      id: 1,
      details: 'go to regina',
      when: '',
      highlighted: false,
    })
    await check({
      id: 2,
      details: 'go to saskatoon',
      when: '',
      highlighted: false,
    })
    await check({
      id: 3,
      details: 'go to moose jaw',
      when: '',
      highlighted: true,
    })
    await check_response('When should I remind you to go to moose jaw')
  })

  test(`NEOS23 REMINDERS add greg as user then -> remind greg to go to regina on monday at 10 am`, async () => {
    await addUser('greg')
    await page.waitForSelector('#query')
    await query("remind greg to go to regina on monday at 10 am")
    await page.click(`#reminder_1`)
    // await query("remind me to go to regina")
    // await query("remind me to go to saskatoon")

    await check({
      id: 1,
      details: 'go to regina',
      who: 'greg - employee#1',
      when: 'on monday at 10 am',
      next: "30/06/2025, 10:00:00 am",
      highlighted: true,
    })
    await check_response()
  })

  test(`NEOS23 REMINDERS remind me to go to regina +  monday at 10 am`, async () => {
    await page.waitForSelector('#query')
    await query("remind me to go to regina\nmonday at 10 am")

    await check({
      id: 1,
      details: 'go to regina',
      who: 'me',
      when: 'monday at 10 am',
      next: "30/06/2025, 10:00:00 am",
      highlighted: true,
    })
    await check_response()
  })

  test(`NEOS23 REMINDERS add greg and bob as user then -> remind greg and bob to go to regina on monday at 10 am`, async () => {
    await addUser('greg')
    await addUser('bob')
    await page.waitForSelector('#query')
    await query("remind greg and bob to go to regina on monday at 10 am")
    // await query("remind me to go to regina")
    // await query("remind me to go to saskatoon")

    await check({
      id: 1,
      details: 'go to regina',
      who: 'greg - employee#1bob - employee#2',
      when: 'on monday at 10 am',
      next: "30/06/2025, 10:00:00 am",
      highlighted: true,
    })
    await check_response()
  })

  test(`NEOS23 REMINDERS add greg and bob as user then -> remind greg to go to regina\nadd bob`, async () => {
    await addUser('greg')
    await addUser('bob')
    await page.waitForSelector('#query')
    await query("remind greg to go to regina")

    await check({
      id: 1,
      details: 'go to regina',
      who: 'greg - employee#1',
      when: '',
      next: '',
      highlighted: true,
    })
    await check_response('When should I remind greg to go to regina')

    await query("add bob")

    await check({
      id: 1,
      details: 'go to regina',
      who: 'greg - employee#1bob - employee#2',
      when: '',
      next: '',
      highlighted: true,
    })
    await check_response('When should I remind greg and bob to go to regina')
  })

  test(`NEOS23 REMINDERS add greg and bob as user then -> remind greg to go to regina\nremind bob to go to saskatoon\nup\nadd bob`, async () => {
    await addUser('greg')
    await addUser('bob')
    await page.waitForSelector('#query')
    await query("remind greg to go to regina")
    await query("remind bob to go to saskatoon")
    await query("up")
    await query("add bob")

    await check({
      id: 1,
      details: 'go to regina',
      who: 'greg - employee#1bob - employee#2',
      when: '',
      next: '',
      highlighted: true,
    })

    await check({
      id: 2,
      details: 'go to saskatoon',
      who: 'bob - employee#2',
      when: '',
      next: '',
      highlighted: false,
    })
    await check_response('When should I remind bob to go to saskatoon')
  })

  test(`NEOS23 REMINDERS add greg and bob as user then -> remind greg and bob to go to regina\nremove bob`, async () => {
    await addUser('greg')
    await addUser('bob')
    await page.waitForSelector('#query')
    await query("remind greg and bob to go to regina")
    await query("remove bob")

    await check({
      id: 1,
      details: 'go to regina',
      who: 'greg - employee#1',
      when: '',
      next: '',
      highlighted: true,
    })
    await check_response('When should I remind greg to go to regina')
  })

  test(`NEOS23 REMINDERS add greg and bob as user then -> remind greg to go to regina\nremind bob too`, async () => {
    await addUser('greg')
    await addUser('bob')
    await page.waitForSelector('#query')
    await query("remind greg to go to regina")
    await query("remind bob too")

    await check({
      id: 1,
      details: 'go to regina',
      who: 'greg - employee#1bob - employee#2',
      when: '',
      next: '',
      highlighted: true,
    })
    await check_response('When should I remind greg and bob to go to regina')
  })

  test(`NEOS23 REMINDERS remind me to go to regina\nnevermind`, async () => {
    await page.waitForSelector('#query')
    await query("remind me to go to regina")
    await query("nevermind")

    await check_response()
  })

  test(`NEO23 REMINDERS remind me to go to regina\nremind me to go to saskatoon\nmonday at 10 am\ntuesday at 9 am`, async () => {
    await page.waitForSelector('#query')
    await query("remind me to go to regina")
    await query("remind me to go to saskatoon")
    await query("monday at 10 am")
    await query("tuesday at 9 am")

    await check({
      id: 1,
      details: 'go to regina',
      who: 'me',
      when: 'tuesday at 9 am',
      next: '01/07/2025, 9:00:00 am',
      highlighted: false,
    })

    await check({
      id: 2,
      details: 'go to saskatoon',
      who: 'me',
      when: 'monday at 10 am',
      next: '30/06/2025, 10:00:00 am',
      highlighted: true,
    })
    await check_response()
  })

});
