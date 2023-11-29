import ItemList from './ItemList'

function WeaponList(props) {
  const { setWeaponId, weaponId, weapons, currentWeaponId } = props
  return ( <ItemList setItemId={setWeaponId} itemId={weaponId} items={weapons} currentItemId={currentWeaponId}/> )
}

export default WeaponList;
