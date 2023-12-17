import ItemList from './ItemList'

function WeaponList(props) {
  const { setWeaponId, weaponId, weapons, selectWeapon } = props
  return ( <ItemList {...props} setItemId={setWeaponId} itemId={weaponId} items={weapons} selectItem={selectWeapon}/> )
}

export default WeaponList;
