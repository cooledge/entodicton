
import Speech from './Speech'

function ToDo(props) {
  return (
    <div className="ToDo">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="tab-content">
              <div className="tab-pane active full" id="status" role="tabpane">
                <ul className="nav nav-tabs">
                  <Speech {...props}/>
                </ul>
                <br/>
                <br/>
                TO DO
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ToDo;
