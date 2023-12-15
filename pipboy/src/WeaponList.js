import ItemList from './ItemList'

function WeaponList(props) {
  const { setWeaponId, weaponId, weapons, selectWeapon } = props
  return ( <ItemList setItemId={setWeaponId} itemId={weaponId} items={weapons} selectItem={selectWeapon}/> )
}

export default WeaponList;
