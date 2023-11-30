import RadioStationList from './RadioStationList'

function Radio(props) {
  return (
    <div className="Radio">
      <div className="container">
        <div className="row">
          <div className="col-12">  
            <RadioStationList { ...props }/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Radio;
