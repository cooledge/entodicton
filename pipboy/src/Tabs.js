function Tabs({ children, active, setActive }) {
  const navLink = (name, opacity) => {
    const role = name.toLowerCase() === active.toLowerCase() ? "tab" : ""
    return (
      <li key={name} className="nav-item">
          <a className="nav-link" style={{opacity}} data-toggle="tab" role={role} onClick={() => setActive(name)}>{name.toUpperCase()}</a>                         
      </li>
    )
  }

  const opacities = children.map( () => 0.2 )
  const selected = children.findIndex( (name) => name === active )  
  opacities[selected] = 1.0
  if (opacities[selected+1]) {
    opacities[selected+1] = 0.5
  }
  if (opacities[selected-1]) {
    opacities[selected-1] = 0.5
  }

  // const links = children.map( navLink )
  const links = []
  for (let i = 0; i < children.length; ++i) {
    links.push(navLink(children[i], opacities[i]))
  }

  return (
    <ul className="nav nav-tabs">
      { links }
    </ul>
  )
}

export default Tabs;
