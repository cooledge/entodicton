import Nav from 'react-bootstrap/Nav'

function Header({ active, setActive }) {
  const navLink = (name) => {
    const activeClass = name.toLowerCase() == active.toLowerCase() ? "active" : ""
    return (
      <li  className={`nav-item ${activeClass}`}>
        <a className="nav-link" onClick={() => setActive(name)}>{name.toUpperCase()}</a>
      </li>
    )
  }
  
  return (
    <div className="Header">
      <Nav className="navbar navbar-expand-lg navbar-light"> 
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav ">
            { navLink("stat") }
            { navLink("inv") }
            { navLink("data") }
            { navLink("map") }
            { navLink("radio") }
          </ul>
        </div>
      </Nav>
    </div>
  );
}

export default Header;
