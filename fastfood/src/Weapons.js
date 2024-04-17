import WeaponList from './WeaponList'
import WeaponStat from './WeaponStat'

function Weapons(props) {
  return (
            <div className="tab-content">
              <div className="tab-pane active full" id="status" role="tabpane">
                <WeaponList {...props}/>
                <WeaponStat {...props}/>
              </div>
            </div>
  );
}

export default Weapons;
