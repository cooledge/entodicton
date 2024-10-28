const { Sessions } = require('../sessions')

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

describe('Sessions Tests', () => {
  it('constructor', async () => {
    const createKM = () => {
    }
    const sessions = new Sessions(createKM)
    expect(sessions).not.toBe()
    expect(sessions.count()).toBe(0)
  })

  it('construct km', async () => {
    let count = 0
    const kms = [{ server: jest.fn() }]
    const createKM = () => {
      count += 1
      return kms[count-1]
    }
    const sessions = new Sessions(createKM)
    expect(await sessions.get("session1")).toBe(kms[0])
    expect(kms[0].server).toHaveBeenCalledTimes(1)
    expect(sessions.count()).toBe(1)
    expect(count).toBe(1)
  })

  it('no deleting stale session', async () => {
    let count = 0
    const kms = [{ server: jest.fn() }]
    const createKM = () => {
      count += 1
      return kms[count-1]
    }
    const sessions = new Sessions(createKM, 25, 1)
    expect(await sessions.get("session1")).toBe(kms[0])
    await sleep(10)
    expect(await sessions.get("session1")).toBe(kms[0])
    await sleep(10)
    expect(await sessions.get("session1")).toBe(kms[0])
    expect(kms[0].server).toHaveBeenCalledTimes(1)
    expect(sessions.count()).toBe(1)
    expect(count).toBe(1)
  })

  it('reuse km', async () => {
    let count = 0
    const km = { server: jest.fn() }
    const createKM = () => {
      count += 1
      return km
    }
    const sessions = new Sessions(createKM)
    expect(await sessions.get("session1")).toBe(km)
    expect(await sessions.get("session1")).toBe(km)
    expect(km.server).toHaveBeenCalledTimes(1)
    expect(sessions.count()).toBe(1)
    expect(count).toBe(1)
  })

  it('multiple sessions', async () => {
    let count = 0
    const kms = [{ server: jest.fn() }, { server: jest.fn() }]
    const createKM = () => {
      count += 1
      return kms[count-1]
    }
    const sessions = new Sessions(createKM)
    expect(await sessions.get("session1")).toBe(kms[0])
    expect(await sessions.get("session2")).toBe(kms[1])
    expect(kms[0].server).toHaveBeenCalledTimes(1)
    expect(kms[1].server).toHaveBeenCalledTimes(1)
    expect(sessions.count()).toBe(2)
    expect(count).toBe(2)
  })

  it('at most n sessions no stale so reject new session', async () => {
    let count = 0
    const kms = [{ server: jest.fn() }, { server: jest.fn() }]
    const createKM = () => {
      count += 1
      return kms[count-1]
    }
    const sessions = new Sessions(createKM, 2)
    expect(await sessions.get("session1")).toBe(kms[0])
    expect(await sessions.get("session2")).toBe(kms[1])
    expect(await sessions.get("session3")).toBe(null)
    expect(kms[0].server).toHaveBeenCalledTimes(1)
    expect(kms[1].server).toHaveBeenCalledTimes(1)
    expect(sessions.count()).toBe(2)
    expect(count).toBe(2)
  })

  it('at most n sessions has stale so delete stale and make new session', async () => {
    let count = 0
    const kms = [{ server: jest.fn() }, { server: jest.fn() }, { server: jest.fn() }]
    const createKM = () => {
      count += 1
      return kms[count-1]
    }
    const sessions = new Sessions(createKM, 2, ttl=10)
    expect(await sessions.get("session1")).toBe(kms[0])
    expect(await sessions.get("session2")).toBe(kms[1])
    await sleep(15)
    expect(await sessions.get("session3")).toBe(kms[2])
    expect(kms[0].server).toHaveBeenCalledTimes(1)
    expect(kms[1].server).toHaveBeenCalledTimes(1)
    expect(kms[2].server).toHaveBeenCalledTimes(1)
    expect(sessions.count()).toBe(2)
    expect(count).toBe(3)
  })
})
