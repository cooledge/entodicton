import Weapons from './Weapons'
import Apparel from './Apparel'
import Aid from './Aid'

function Inv(props) {
  const {activeInvTab, setActiveInvTab} = props;
  const navLink = (name) => {
    const role = name.toLowerCase() === activeInvTab.toLowerCase() ? "tab" : ""
    return (
      <li className="nav-item">
          <a className="nav-link" data-toggle="tab" role={role} onClick={() => setActiveInvTab(name)}>{name.toUpperCase()}</a>
      </li>
    )
  }

  return (
    <div className="Inv">
      <div className="container">
        <div className="row">
          <div className="col-12">  
            <ul className="nav nav-tabs">
              { navLink('weapons') }
              { navLink('apparel') }
              { navLink('aid') }
            </ul>
            { activeInvTab === 'weapons' && <Weapons {...props} /> }
            { activeInvTab === 'apparel' && <Apparel {...props} /> }
            { activeInvTab === 'aid' && <Aid {...props} /> }
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inv;
