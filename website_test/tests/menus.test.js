const puppeteer = require('puppeteer')
const tests = require('./tests.json')
const menu = require('./Menu.json')
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

const demoWriter = new DemoWriter('../menus/src/demo.json')

describe('tests for menus page', () => {

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
    await page.goto(`${URL}/menus/`)
    await page.waitForSelector('#query')
    demoWriter.startTest()
  }, timeout)

  afterEach( async () => {
    await page.close()
    demoWriter.endTest()
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

  test(`MENUS test page loads`, async () => {
    await page.waitForSelector('#query')
  }, timeout);

  const query = async (query) => { 
    demoWriter.add(query.toLowerCase())
    await page.waitForSelector('#query')
    await page.type('#query', query)
    await page.click('#submit')
    await page.waitForSelector(`#queryCounter${counter+1}`)
    counter += 1
  }

  const goto_menu_test = async (id, text) => {
    test(`MENUS menu direct goto's for ${id}`, async () => {
      await page.waitForSelector('#query')
      await query(text)
      const className = 'rc-menu-submenu-open'
      await waitForClass(id, className)
      const element = await page.$(`#${id}`)
      const classNames = await (await element.getProperty('className')).jsonValue()
      expect(classNames.includes(className)).toBe(true)
    }, timeout);
  }

  menu.forEach((menu) => {
    goto_menu_test(menu.key, menu.text)
  })

  const menu_close_test = async (id, text) => {
    test(`MENUS menu close test for ${id}`, async () => {
      await page.waitForSelector('#query')
      await query(text)
      const className = 'rc-menu-submenu-open'
      await waitForClass(id, className)
      await query('close')
      await sleep(1000)
      const element = await page.$(`#${id}`)
      const classNames = await (await element.getProperty('className')).jsonValue()
      expect(classNames.includes(className)).toBe(false)
    }, timeout);
  }

  menu.forEach((menu) => {
    if (menu.children.find((child) => child.text?.toLowerCase() == 'close')) {
      return
    }
    menu_close_test(menu.key, menu.text)
  })

  const goto_menu_item_test = (id, text) => {
    // close at the top level is menu close not file close
    if (text === 'Close') {
      return
    }
    test(`MENUS menu item direct goto's for ${id} with text ${text}`, async () => {
      console.log(`goto_menu_item_test(${id}, ${text})`)
      await page.waitForSelector('#query')
      await query(text)
      const className = 'rc-menu-item-selected'
      await waitForClass(id, className)
      const element = await page.$(`#${id}`)
      const classNames = await (await element.getProperty('className')).jsonValue()
      expect(classNames.includes(className)).toBe(true)
    }, timeout);
  }

  // goto_menu_item_test('View-ShowWhitespace', 'Show Whitespace')

  menu.forEach((menu) => {
    if (menu.text !== 'View') {
      return
    }
    for (const child of menu.children) {
      if (child.divider) {
        continue
      }
      goto_menu_item_test(child.key, child.text)
    }
  })

  const goto_menu_item_test_with_menu_open = (id, text) => {
    test(`MENUS menu item goto's with menu open for ${id}`, async () => {
      await page.waitForSelector('#query')
      await query(text)
      const className = 'rc-menu-item-selected'
      await waitForClass(id, className)
      const element = await page.$(`#${id}`)
      const classNames = await (await element.getProperty('className')).jsonValue()
      expect(classNames.includes(className)).toBe(true)
    }, timeout);
  }

  menu.forEach((menu) => {
    for (const child of menu.children) {
      if (child.divider) {
        continue
      }
      goto_menu_item_test_with_menu_open(child.key, `${menu.text} ${child.text}`)
    }
  })

  const goto_menu_item_go_up = (id, up, text) => {
    test(`MENUS menu item up menu open for ${id}`, async () => {
      await page.waitForSelector('#query')
      await query(`${text} up`)
      const className = 'rc-menu-item-selected'
      await waitForClass(up, className)
      const element = await page.$(`#${up}`)
      const classNames = await (await element.getProperty('className')).jsonValue()
      expect(classNames.includes(className)).toBe(true)
    }, timeout);
  }

  menu.forEach((menu) => {
    let previous
    for (const child of menu.children) {
      if (child.divider) {
        continue
      }
      if (previous) {
        goto_menu_item_go_up(child.key, previous, `${menu.text} ${child.text}`)
      }
      previous = child.key
    }
  })

  const goto_menu_item_go_down = (id, down, text) => {
    test(`MENUS menu item down menu open for ${id}`, async () => {
      await page.waitForSelector('#query')
      await query(`${text} down`)
      const className = 'rc-menu-item-selected'
      await waitForClass(down, className)
      const element = await page.$(`#${down}`)
      const classNames = await (await element.getProperty('className')).jsonValue()
      expect(classNames.includes(className)).toBe(true)
    }, timeout);
  }

  menu.forEach((menu) => {
    let previous
    for (const child of menu.children) {
      if (child.divider) {
        continue
      }
      if (previous) {
        goto_menu_item_go_down(previous.key, child.key, `${menu.text} ${previous.text}`)
      }
      previous = child
    }
  })

  const goto_menu_item_go_down_one_plus_one = (id, down, text) => {
    test(`MENUS menu item down 1+1 menu open for ${id}`, async () => {
      await page.waitForSelector('#query')
      await query(`${text} down 1+1`)
      const className = 'rc-menu-item-selected'
      await waitForClass(down, className)
      const element = await page.$(`#${down}`)
      const classNames = await (await element.getProperty('className')).jsonValue()
      expect(classNames.includes(className)).toBe(true)
    }, timeout);
  }

  // goto_menu_item_go_down_one_plus_one('File-New', 'File-OpenRemote', 'new')
  menu.forEach((menu) => {
    let previous = []
    for (const child of menu.children) {
      if (child.divider) {
        continue
      }
      if (previous.length > 2) {
        const start = previous[previous.length-2]
        goto_menu_item_go_down_one_plus_one(start.key, child.key, `${menu.text} ${start.text}`)
      }
      previous.push(child)
    }
  })

  const goto_menu_go_left = (id, left, text) => {
    test(`MENUS menu left for ${id}`, async () => {
      await page.waitForSelector('#query')
      await query(`${text} left`)
      const className = 'rc-menu-submenu-open'
      await waitForClass(left, className)
      const element = await page.$(`#${left}`)
      const classNames = await (await element.getProperty('className')).jsonValue()
      expect(classNames.includes(className)).toBe(true)
    }, timeout);
  }

  let previous
  menu.forEach((menu) => {
    if (previous) {
      goto_menu_go_left(menu.key, previous.key, menu.text)
    }
    previous = menu
  })

  const goto_menu_go_right = (id, right, text) => {
    test(`MENUS menu right for ${id}`, async () => {
      await page.waitForSelector('#query')
      await query(`${text} right`)
      const className = 'rc-menu-submenu-open'
      await waitForClass(right, className)
      const element = await page.$(`#${right}`)
      const classNames = await (await element.getProperty('className')).jsonValue()
      expect(classNames.includes(className)).toBe(true)
    }, timeout);
  }

  previous = null
  menu.forEach((menu) => {
    if (previous) {
      goto_menu_go_right(previous.key, menu.key, previous.text)
    }
    previous = menu
  })

  const goto_menu_item_with_mouse_then_go_up = (menu, id, up) => {
    test(`MENUS menu item up menu open for ${id}`, async () => {
      await page.waitForSelector('#query')

      demoWriter.ignore()
      await query(menu)
      await page.waitForSelector(`#${menu}`)
      await page.waitForSelector(`#${id}`)
      await page.click(`#${id}`)
      await query("up")
      const className = 'rc-menu-item-selected'
      await waitForClass(up, className)
      const element = await page.$(`#${up}`)
      const classNames = await (await element.getProperty('className')).jsonValue()
      expect(classNames.includes(className)).toBe(true)
    }, timeout);
  }

  // goto_menu_item_with_mouse_then_go_up('File', 'File-Open', 'File-New')

  menu.forEach((menu) => {
    let previous
    // only the visible once get clicks
    let counter = 0
    for (const child of menu.children) {
      if (child.divider) {
        continue
      }
      if (previous && counter < 10) {
        goto_menu_item_with_mouse_then_go_up(menu.text, child.key, previous.key)
      }
      previous = child
      counter += 1
    }
  })

});
