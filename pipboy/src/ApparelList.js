import ItemList from './ItemList'

function ApparelList(props) {
  const { setApparelId, apparelId, apparel, selectApparel, setSelector } = props
  // setSelector( () => () => selectApparel(apparelId) )
  return ( <ItemList {...props} setItemId={setApparelId} itemId={apparelId} items={apparel} selectItem={selectApparel}/> )
}

export default ApparelList;
