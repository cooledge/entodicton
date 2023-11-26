import ItemList from './ItemList'

function SpecialList({ specialId, setSpecialId, special }) {
  return ( <ItemList setItemId={setSpecialId} itemId={specialId} items={special}/> )
}

export default SpecialList;
