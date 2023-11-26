import Inv from './Inv'
import Status from './Status'
import Special from './Special'
import Perks from './Perks'

function Stat(props) {
  const { activeStatTab, setActiveStatTab } = props
  const navLink = (name) => {
    const role = name.toLowerCase() == activeStatTab.toLowerCase() ? "tab" : ""
    return (
      <li className="nav-item">
          <a className="nav-link" data-toggle="tab" role={role} onClick={() => setActiveStatTab(name)}>{name.toUpperCase()}</a>                         
      </li>
    )
  }

  return (
    <div className="Stat">
      <div className="container">
        <div className="row">
          <div className="col-12">  
            <ul className="nav nav-tabs">
              { navLink('status') }
              { navLink('special') }
              { navLink('perks') }
            </ul>
            { activeStatTab == 'status' && <Status { ...props } /> }
            { activeStatTab == 'special' && <Special { ...props } /> }
            { activeStatTab == 'perks' && <Perks { ...props } /> }
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stat;
