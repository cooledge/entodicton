import ApparelList from './ApparelList'
import ApparelStat from './ApparelStat'

function Apparel(props) {
  return (
            <div className="tab-content">
              <div className="tab-pane active full" id="status" role="tabpane">
                <ApparelList {...props}/>
                <ApparelStat {...props}/>
              </div>
            </div>
  );
}

export default Apparel;
