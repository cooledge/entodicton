import ItemList from './ItemList'

function ApparelList({ setApparelId, apparelId, apparel }) {
  return ( <ItemList setItemId={setApparelId} itemId={apparelId} items={apparel}/> )
}

export default ApparelList;
