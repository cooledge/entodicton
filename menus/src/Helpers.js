const calculateDowns = (defs) => {
  const downs = {}
  calculateDownsHelper(defs, downs)
  return downs
}

const calculateDownsHelper = (defs, downs) => {
  if (Array.isArray(defs)) {
    for (const def of defs) {
      calculateDownsHelper(def, downs)
    }
  } else if (defs.children) {
    let previous
    for (const child of defs.children) {
      if (child.divider) {
        continue
      }
      if (previous) {
        downs[previous.key] = child.key
        previous = child
      } else {
        previous = child
      }
    }
  }
  return downs
}

const calculateUps = (defs) => {
  const ups = {}
  calculateUpsHelper(defs, ups)
  return ups
}

const calculateUpsHelper = (defs, ups) => {
  if (Array.isArray(defs)) {
    for (const def of defs) {
      calculateUpsHelper(def, ups)
    }
  } else if (defs.children) {
    let previous
    for (const child of defs.children) {
      if (child.divider) {
        continue
      }
      if (previous) {
        ups[child.key] = previous.key
        previous = child
      } else {
        previous = child
      }
    }
  }
  return ups
}

const calculateParents = (defs) => {
  const parents = {}
  calculateParentsHelper(defs, parents)
  return parents
}

const calculateParentsHelper = (defs, parents) => {
  if (Array.isArray(defs)) {
    for (const def of defs) {
      calculateParentsHelper(def, parents)
    }
  } else if (defs.children) {
    for (const child of defs.children) {
      if (child.divider) {
        continue
      }
      parents[child.key] = defs.key
    }
  }
  return parents
}

module.exports = {
  calculateDowns,
  calculateUps,
  calculateParents,
}
