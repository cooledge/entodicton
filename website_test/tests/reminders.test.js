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

  const check = async ({id, details, when, next, response, highlighted}) => {
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

    const timeSpan = await page.$eval(`#reminder_${id} .time`, el => el.textContent);
    expect(timeSpan).toBe(when);

    const nextSpan = await page.$eval(`#reminder_${id} .next`, el => el.textContent);
    expect(nextSpan).toBe(next || '');

    const spans = await page.$$(`#reminder_${id} span`);
    expect(spans.length).toBe(3);

    if (response) {
      const responseSpan = await page.$eval('.response', el => el.textContent);
      expect(responseSpan).toBe(response);
    } else {
      const responseElements = await page.$$('.response');
      expect(responseElements.length).toBe(0);
    }
  }

  test(`NEOS23 REMINDERS remind me to go to regina`, async () => {
    await page.waitForSelector('#query')
    await query("remind me to go to regina")

    await check({
      id: 1,
      details: 'go to regina',
      when: '',
      response: 'When should I remind you to go to regina ',
      highlighted: true,
    })
  })

  test(`NEOS23 REMINDERS remind me to go to regina`, async () => {
    await page.waitForSelector('#query')
    await query("remind me to go to regina\nmonday")

    await check({
      id: 1,
      details: 'go to regina',
      when: 'monday',
      response: '',
      highlighted: true,
    })
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
      response: 'When should I remind you to go to regina ',
      highlighted: false,
    })
    await check({
      id: 2,
      details: 'go to saskatoon',
      when: '',
      response: 'When should I remind you to go to regina ',
      highlighted: true,
    })
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
      response: 'When should I remind you to go to regina ',
      highlighted: true,
    })
    await check({
      id: 2,
      details: 'go to saskatoon',
      when: '',
      response: 'When should I remind you to go to regina ',
      highlighted: false,
    })
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
      response: 'When should I remind you to go to regina ',
      highlighted: true,
    })
    await check({
      id: 2,
      details: 'go to saskatoon',
      when: '',
      response: 'When should I remind you to go to regina ',
      highlighted: false,
    })
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
      response: 'When should I remind you to go to regina ',
      highlighted: true,
    })
    await check({
      id: 2,
      details: 'go to saskatoon',
      when: '',
      response: 'When should I remind you to go to regina ',
      highlighted: false,
    })
    await check({
      id: 3,
      details: 'go to moose jaw',
      when: '',
      response: 'When should I remind you to go to regina ',
      highlighted: false,
    })
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
      response: 'When should I remind you to go to regina ',
      highlighted: false,
    })
    await check({
      id: 2,
      details: 'go to saskatoon',
      when: '',
      response: 'When should I remind you to go to regina ',
      highlighted: true,
    })
  })

  test(`NEOS23 REMINDERS down 2`, async () => {
    await page.waitForSelector('#query')
    await query("remind me to go to regina\nremind me to go to saskatoon\nremind me to go to moose jaw\nup 2\ndown 2")

    await check({
      id: 1,
      details: 'go to regina',
      when: '',
      response: 'When should I remind you to go to regina ',
      highlighted: false,
    })
    await check({
      id: 2,
      details: 'go to saskatoon',
      when: '',
      response: 'When should I remind you to go to regina ',
      highlighted: false,
    })
    await check({
      id: 3,
      details: 'go to moose jaw',
      when: '',
      response: 'When should I remind you to go to regina ',
      highlighted: true,
    })
  })


//  const goto_menu_test = async (id, text) => {
//    test(`REMINDERS menu direct goto's for ${id}`, async () => {
//      await page.waitForSelector('#query')
//      await query(text)
//      const className = 'rc-menu-submenu-open'
//      await waitForClass(id, className)
//      const element = await page.$(`#${id}`)
//      const classNames = await (await element.getProperty('className')).jsonValue()
//      expect(classNames.includes(className)).toBe(true)
//    }, timeout);
//  }
//
//  menu.forEach((menu) => {
//    goto_menu_test(menu.key, menu.text)
//  })
//
//  const menu_close_test = async (id, text) => {
//    test(`REMINDERS menu close test for ${id}`, async () => {
//      await page.waitForSelector('#query')
//      await query(text)
//      const className = 'rc-menu-submenu-open'
//      await waitForClass(id, className)
//      await query('close')
//      await sleep(1000)
//      const element = await page.$(`#${id}`)
//      const classNames = await (await element.getProperty('className')).jsonValue()
//      expect(classNames.includes(className)).toBe(false)
//    }, timeout);
//  }
//
//  menu.forEach((menu) => {
//    if (menu.children.find((child) => child.text?.toLowerCase() == 'close')) {
//      return
//    }
//    menu_close_test(menu.key, menu.text)
//  })
//
//  const goto_menu_item_test = (id, text) => {
//    // close at the top level is menu close not file close
//    if (text === 'Close') {
//      return
//    }
//    test(`NEO23 REMINDERS menu item direct goto's for ${id} with text ${text}`, async () => {
//      console.log(`goto_menu_item_test(${id}, ${text})`)
//      await page.waitForSelector('#query')
//      await query(text)
//      const className = 'rc-menu-item-selected'
//      await waitForClass(id, className)
//      const element = await page.$(`#${id}`)
//      const classNames = await (await element.getProperty('className')).jsonValue()
//      expect(classNames.includes(className)).toBe(true)
//    }, timeout);
//  }
//
//  // goto_menu_item_test('View-ShowWhitespace', 'Show Whitespace')
//
//  menu.forEach((menu) => {
//    if (menu.text !== 'View') {
//      return
//    }
//    for (const child of menu.children) {
//      if (child.divider) {
//        continue
//      }
//      goto_menu_item_test(child.key, child.text)
//    }
//  })
//
//  const goto_menu_item_test_with_menu_open = (id, text) => {
//    test(`REMINDERS menu item goto's with menu open for ${id}`, async () => {
//      await page.waitForSelector('#query')
//      await query(text)
//      const className = 'rc-menu-item-selected'
//      await waitForClass(id, className)
//      const element = await page.$(`#${id}`)
//      const classNames = await (await element.getProperty('className')).jsonValue()
//      expect(classNames.includes(className)).toBe(true)
//    }, timeout);
//  }
//
//  menu.forEach((menu) => {
//    for (const child of menu.children) {
//      if (child.divider) {
//        continue
//      }
//      goto_menu_item_test_with_menu_open(child.key, `${menu.text} ${child.text}`)
//    }
//  })
//
//  const goto_menu_item_go_up = (id, up, text) => {
//    test(`REMINDERS menu item up menu open for ${id}`, async () => {
//      await page.waitForSelector('#query')
//      await query(`${text} up`)
//      const className = 'rc-menu-item-selected'
//      await waitForClass(up, className)
//      const element = await page.$(`#${up}`)
//      const classNames = await (await element.getProperty('className')).jsonValue()
//      expect(classNames.includes(className)).toBe(true)
//    }, timeout);
//  }
//
//  menu.forEach((menu) => {
//    let previous
//    for (const child of menu.children) {
//      if (child.divider) {
//        continue
//      }
//      if (previous) {
//        goto_menu_item_go_up(child.key, previous, `${menu.text} ${child.text}`)
//      }
//      previous = child.key
//    }
//  })
//
//  const goto_menu_item_go_down = (id, down, text) => {
//    test(`REMINDERS menu item down menu open for ${id}`, async () => {
//      await page.waitForSelector('#query')
//      await query(`${text} down`)
//      const className = 'rc-menu-item-selected'
//      await waitForClass(down, className)
//      const element = await page.$(`#${down}`)
//      const classNames = await (await element.getProperty('className')).jsonValue()
//      expect(classNames.includes(className)).toBe(true)
//    }, timeout);
//  }
//
//  menu.forEach((menu) => {
//    let previous
//    for (const child of menu.children) {
//      if (child.divider) {
//        continue
//      }
//      if (previous) {
//        goto_menu_item_go_down(previous.key, child.key, `${menu.text} ${previous.text}`)
//      }
//      previous = child
//    }
//  })
//
//  const goto_menu_item_go_down_one_plus_one = (id, down, text) => {
//    test(`REMINDERS menu item down 1+1 menu open for ${id}`, async () => {
//      await page.waitForSelector('#query')
//      await query(`${text} down 1+1`)
//      const className = 'rc-menu-item-selected'
//      await waitForClass(down, className)
//      const element = await page.$(`#${down}`)
//      const classNames = await (await element.getProperty('className')).jsonValue()
//      expect(classNames.includes(className)).toBe(true)
//    }, timeout);
//  }
//
//  // goto_menu_item_go_down_one_plus_one('File-New', 'File-OpenRemote', 'new')
//  menu.forEach((menu) => {
//    let previous = []
//    for (const child of menu.children) {
//      if (child.divider) {
//        continue
//      }
//      if (previous.length > 2) {
//        const start = previous[previous.length-2]
//        goto_menu_item_go_down_one_plus_one(start.key, child.key, `${menu.text} ${start.text}`)
//      }
//      previous.push(child)
//    }
//  })
//
//  const goto_menu_go_left = (id, left, text) => {
//    test(`REMINDERS menu left for ${id}`, async () => {
//      await page.waitForSelector('#query')
//      await query(`${text} left`)
//      const className = 'rc-menu-submenu-open'
//      await waitForClass(left, className)
//      const element = await page.$(`#${left}`)
//      const classNames = await (await element.getProperty('className')).jsonValue()
//      expect(classNames.includes(className)).toBe(true)
//    }, timeout);
//  }
//
//  let previous
//  menu.forEach((menu) => {
//    if (previous) {
//      goto_menu_go_left(menu.key, previous.key, menu.text)
//    }
//    previous = menu
//  })
//
//  const goto_menu_go_right = (id, right, text) => {
//    test(`REMINDERS menu right for ${id}`, async () => {
//      await page.waitForSelector('#query')
//      await query(`${text} right`)
//      const className = 'rc-menu-submenu-open'
//      await waitForClass(right, className)
//      const element = await page.$(`#${right}`)
//      const classNames = await (await element.getProperty('className')).jsonValue()
//      expect(classNames.includes(className)).toBe(true)
//    }, timeout);
//  }
//
//  previous = null
//  menu.forEach((menu) => {
//    if (previous) {
//      goto_menu_go_right(previous.key, menu.key, previous.text)
//    }
//    previous = menu
//  })
//
//  const goto_menu_item_with_mouse_then_go_up = (menu, id, up) => {
//    test(`REMINDERS menu item up menu open for ${id}`, async () => {
//      await page.waitForSelector('#query')
//
//      await query(menu)
//      await page.waitForSelector(`#${menu}`)
//      await page.waitForSelector(`#${id}`)
//      await page.click(`#${id}`)
//      await query("up")
//      const className = 'rc-menu-item-selected'
//      await waitForClass(up, className)
//      const element = await page.$(`#${up}`)
//      const classNames = await (await element.getProperty('className')).jsonValue()
//      expect(classNames.includes(className)).toBe(true)
//    }, timeout);
//  }
//
//  // goto_menu_item_with_mouse_then_go_up('File', 'File-Open', 'File-New')
//
//  menu.forEach((menu) => {
//    let previous
//    // only the visible once get clicks
//    let counter = 0
//    for (const child of menu.children) {
//      if (child.divider) {
//        continue
//      }
//      if (previous && counter < 10) {
//        goto_menu_item_with_mouse_then_go_up(menu.text, child.key, previous.key)
//      }
//      previous = child
//      counter += 1
//    }
//  })

});
