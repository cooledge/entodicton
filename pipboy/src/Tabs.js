function Tabs({ children, active, setActive }) {
  const navLink = (name) => {
    const role = name.toLowerCase() === active.toLowerCase() ? "tab" : ""
    return (
      <li className="nav-item">
          <a className="nav-link" data-toggle="tab" role={role} onClick={() => setActive(name)}>{name.toUpperCase()}</a>                         
      </li>
    )
  }
  
  const links = children.map( navLink )
  return (
    <ul className="nav nav-tabs">
      { links }
    </ul>
  )
}

export default Tabs;
