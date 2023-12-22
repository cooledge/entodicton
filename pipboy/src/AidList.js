import ItemList from './ItemList'

function AidList(props) {
  const { setAidId, aidId, aid, selectAid, aidFilter } = props
  return ( <ItemList {...props} setItemId={setAidId} itemId={aidId} items={aid.filter(aidFilter)} selectItem={selectAid}/> )
}

export default AidList;
