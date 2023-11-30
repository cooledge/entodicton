import ItemList from './ItemList'

function RadioStationList(props) {
  const { setRadioStationId, radioStationId, radioStations } = props
  return ( <ItemList setItemId={setRadioStationId} itemId={radioStationId} items={radioStations}/> )
}

export default RadioStationList;
