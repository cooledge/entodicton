import ItemList from './ItemList'

function AidList({ setAidId, aidId, aid }) {
  return ( <ItemList setItemId={setAidId} itemId={aidId} items={aid}/> )
}

export default AidList;
