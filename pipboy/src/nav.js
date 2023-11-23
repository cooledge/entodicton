const navLink = (name, getter, setter) => {
  const activeClass = name.toLowerCase() == getter.toLowerCase() ? "active" : ""
  return (
    <li  className={`nav-item ${activeClass}`}>
      <a className="nav-link" onClick={() => setter(name)}>{name.toUpperCase()}</a>
    </li>
  )
}

const nav = (names, getter, setter) => {
  return (
          <ul className="navbar-nav ">
            { navLink("stat", getter, setter) }
            { navLink("inv", getter, setter) }
            { navLink("data", getter, setter) }
            { navLink("map", getter, setter) }
            { navLink("radio", getter, setter) }
          </ul>
  )
}

export default nav
