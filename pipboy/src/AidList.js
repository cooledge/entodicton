import ItemList from './ItemList'

function AidList(props) {
  const { setAidId, aidId, aid, selectAid } = props
  return ( <ItemList {...props} setItemId={setAidId} itemId={aidId} items={aid} selectItem={selectAid}/> )
}

export default AidList;
