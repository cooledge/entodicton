import Tabs from './Tabs'
import Weapons from './Weapons'
import Quests from './Quests'

function Data(props) {
  const {activeDataTab, setActiveDataTab} = props;
  // quests workshops stats
            // { activeDataTab === 'workshops' && <Workshops {...props} /> }
  return (
    <div className="Data">
      <div className="container">
        <div className="row">
          <div className="col-12">  
            <Tabs active={activeDataTab} setActive={setActiveDataTab}>
              { 'quests' }
              { 'workshops' }
              { 'stats' }
            </Tabs>
            { activeDataTab === 'quests' && <Quests {...props} /> }
          </div>
        </div>
      </div>
    </div>
  );
}

export default Data;
