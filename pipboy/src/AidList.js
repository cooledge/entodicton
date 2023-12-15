import ItemList from './ItemList'

function AidList({ setAidId, aidId, aid, selectAid }) {
  return ( <ItemList setItemId={setAidId} itemId={aidId} items={aid} selectItem={selectAid}/> )
}

export default AidList;
