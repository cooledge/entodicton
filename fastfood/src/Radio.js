import RadioStationList from './RadioStationList'
import Speech from './Speech'

function Radio(props) {
  return (
    <div className="Radio">
      <div className="container">
        <div className="row">
          <div className="col-12">  
            <div className="tab-content">
              <div className="tab-pane active full" id="status" role="tabpane">
                <ul className="nav nav-tabs">
                  <Speech {...props}/>
                </ul>
                <RadioStationList { ...props }/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Radio;
