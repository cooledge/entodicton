import Nav from 'react-bootstrap/Nav'

function Header({ activeTab, setActiveTab }) {
  const navLink = (name) => {
    const activeClass = name.toLowerCase() == activeTab.toLowerCase() ? "active" : ""
    return (
      <li  className={`nav-item ${activeClass}`}>
        <a className="nav-link" onClick={() => setActiveTab(name)}>{name.toUpperCase()}</a>
      </li>
    )
  }
  
  return (
    <div className="Header">
      <a style={ {'color': 'white' } } href={'https://www.youtube.com/watch?v=cZTpy1vPdz4'} target="_blank" rel="noreferrer">YouTube Demo of Using This POC Page (with speech recognition)</a>
      <a style={ {'color': 'white', 'margin-left': '20px'} } href={'https://www.youtube.com/watch?v=orWJYLbI1Q4'} target="_blank" rel="noreferrer">YouTube Demo of Using This POC Page (current version no sr)</a>
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
