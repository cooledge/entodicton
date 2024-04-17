import ItemList from './ItemList'

function PerkList({setPerkId, perkId, perks}) {
  return ( <ItemList setItemId={setPerkId} itemId={perkId} items={perks}/> )
}

export default PerkList;
