import ItemList from './ItemList'

function ApparelList({ setApparelId, apparelId, apparel, selectApparel }) {
  return ( <ItemList setItemId={setApparelId} itemId={apparelId} items={apparel} selectItem={selectApparel}/> )
}

export default ApparelList;
