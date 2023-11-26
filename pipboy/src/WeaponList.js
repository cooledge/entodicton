import ItemList from './ItemList'

function WeaponList({ setWeaponId, weaponId, weapons }) {
  return ( <ItemList setItemId={setWeaponId} itemId={weaponId} items={weapons}/> )
}

export default WeaponList;
