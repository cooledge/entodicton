import Navbar from 'react-bootstrap/Navbar'

function Footer() {
  return (
    <div className="Footer">
      <Navbar className="navbar navbar-light pip-footer">
        <dic className="row">
          <div className="col-3">
            HP 90/90
          </div>
          <div className="col-6">
            <span>LEVEL 1</span>   
            <div className="level-progress">
              <div className="level-progress-indicator"></div>
            </div>
          </div>
          <div className="col-3 text-right">
            AP 50/50
          </div>
        </dic>
      </Navbar>
    </div>
  );
}

export default Footer;
