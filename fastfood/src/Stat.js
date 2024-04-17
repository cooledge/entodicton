import Status from './Status'
import Special from './Special'
import Perks from './Perks'
import Tabs from './Tabs'

function Stat(props) {
  const { activeStatTab, setActiveStatTab } = props

  return (
    <div className="Stat">
      <div className="container">
        <div className="row">
          <div className="col-12">  
            <Tabs {...props} active={activeStatTab} setActive={setActiveStatTab}>
              {"status"}
              {"special"}
              {"perks"}
            </Tabs>
            { activeStatTab === 'status' && <Status { ...props } /> }
            { activeStatTab === 'special' && <Special { ...props } /> }
            { activeStatTab === 'perks' && <Perks { ...props } /> }
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stat;
