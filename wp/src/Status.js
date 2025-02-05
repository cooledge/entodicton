import _2344 from './images/2344.png'
import _333 from './images/333.png'
import helmet from './images/helmet.png'
import aimer from './images/33.ico'
import radiation from './images/radiation.png'
import energy from './images/energy.png'

function Status({ health, currentWeapon }) {
  const width = (value) => {
    return 40 * (value / 100)
  }
  const bar = (value) => {
    return (
              <div className="stat-bar">
                <div className="level-progress">
                  <div className="level-progress-indicator" style={ { 'width': width(value) } }></div>
                </div>
              </div>
    )
  }
  const weapon = currentWeapon() || {}
  return (
            <div className="tab-content">
              <div className="tab-pane active" style={ { height: "calc(100vh - 180px)" } } id="status" role="tabpanel">
                  <div className="center-image">
                    <img src={_2344} alt="" />
                  </div>
                  <div className="stat-bars">   
                  <div className="row">
                    <div className="col-12">
                      { bar( health.head ) }
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-3">
                      { bar( health.arm.right ) }
                    </div>

                    <div className="col-6">
                    </div>

                    <div className="col-3">
                      { bar( health.arm.left ) }
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-3">
                      { bar( health.leg.right ) }
                    </div>
                    <div className="col-6">
                    </div>
                    <div className="col-3">
                      { bar( health.leg.left ) }
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12">
                      { bar( health.torso ) }
                    </div>
                  </div>
                  <div className="row stat-numbers">
                    <div className="spacer-numbers"></div>
                      <div className="col-2">
                        <img src={_333} className="img-responsive" />
                      </div>
                      <div className="col-1">
                        <div className="icon">
                          <img src={aimer} className="sm-image img-responsive"/>
                        </div>
                        { /* gun damage */ }
                        <div className="points">{weapon.damage}</div>
                      </div>
                      <div className="col-1 transparent">
                      </div>
                      <div className="col-2">
                        <img src={helmet} alt=""/>
                      </div>
                      <div className="col-1">
                        <div className="icon">
                          <img src={energy} className="en-image img-responsive" />
                        </div>
                        { /* electricity resistance from apparel */ }
                      <div className="points">10</div>
                    </div>
                    <div className="col-1">
                      <div className="icon">
                        <img src={radiation} className="rad-image img-responsive" />
                        { /* radiation resistance from apparel */ }
                      </div>
                      <div className="points">18</div>
                    </div>
                    <div className="col-2 transparent"></div>
                  </div>
                </div>
              </div>
            </div>
  );
}

export default Status;
