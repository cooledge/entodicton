import Navbar from 'react-bootstrap/Navbar'
import aimer from './images/33.ico'


/*
stat

  hp level ap

inv
  weight/total         caps with (c)        gun with aimer then damage
  212 / 265


data
11.18.2287      6:45 am

quests workshops stats
 square marks equipped
*/

function StatFooter({hp, ap}) {
  return (
    <dic className="row">
      <div className="col-3">
        HP {hp.current}/{hp.total}
      </div>
      <div className="col-6">
        <span>LEVEL 1</span>   
        <div className="level-progress">
          <div className="level-progress-indicator"></div>
        </div>
      </div>
      <div className="col-3 text-right">
        AP {ap.current}/{ap.total}
      </div>
    </dic>
  )
}

function InvFooter({currentWeight, maxWeight, currentWeapon, caps}) {
  const weapon = currentWeapon() || {}

  return (
    <dic className="row">
      <div className="col-3">
        Weight/Total {currentWeight}/{maxWeight}
      </div>
      <div className="col-6">
        <span>CAPS {caps}</span>   
      </div>
      <div className="col-3 text-right">
        <img style={{ 'marginRight': '10px' }} src={aimer} className="sm-image img-responsive"/>
        { /* gun damage */ }
        {weapon.damage}
      </div>
    </dic>
  )
}

function TimeFooter({currentWeight, maxWeight, currentWeapon, caps}) {
  const weapon = currentWeapon() || {}

  return (
    <dic className="row">
      <div className="col-3">
        DATE 11.18.2287
      </div>
      <div className="col-6">
        <span>TIME 6:45 am</span>   
      </div>
    </dic>
  )
}

// function Footer({hp, ap, currentWeight, totalWeight}) {
function Footer(props) {
  const { activeTab } = props
  return (
    <div className="Footer">
      <Navbar className="navbar navbar-light pip-footer">
        { activeTab == 'stat' && <StatFooter {...props}/> }
        { activeTab == 'inv' && <InvFooter {...props}/> }
        { !['stat', 'inv'].includes(activeTab) && <TimeFooter {...props}/> }
      </Navbar>
    </div>
  );
}

export default Footer;
