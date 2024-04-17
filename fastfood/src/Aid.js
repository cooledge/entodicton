import AidList from './AidList'
import AidStat from './AidStat'

function Aid(props) {
  return (
            <div className="tab-content">
              <div className="tab-pane active full" id="status" role="tabpane">
                <AidList {...props}/>
                <AidStat {...props}/>
              </div>
            </div>
  );
}

export default Aid;
