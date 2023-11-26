import Weapons from './Weapons'
import Apparel from './Apparel'
import Aid from './Aid'
import Tabs from './Tabs'

function Inv(props) {
  const {activeInvTab, setActiveInvTab} = props;

  return (
    <div className="Inv">
      <div className="container">
        <div className="row">
          <div className="col-12">  
            <Tabs active={activeInvTab} setActive={setActiveInvTab}>
              { 'weapons' }
              { 'apparel' }
              { 'aid' }
            </Tabs>
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
