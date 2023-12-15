import ItemList from './ItemList'

function ApparelList(props) {
  const { setApparelId, apparelId, apparel, selectApparel } = props
  return ( <ItemList {...props} setItemId={setApparelId} itemId={apparelId} items={apparel}/> )
}

export default ApparelList;
