import ItemList from './ItemList'

function ApparelList(props) {
  const { setApparelId, apparelId, apparel, selectApparel, apparelFilter } = props
  return ( <ItemList {...props} setItemId={setApparelId} itemId={apparelId} items={apparel.filter(apparelFilter)} selectItem={selectApparel}/> )
}

export default ApparelList;
