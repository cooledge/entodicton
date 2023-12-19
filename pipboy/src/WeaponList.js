import ItemList from './ItemList'

function WeaponList(props) {
  const { setWeaponId, weaponId, weapons, selectWeapon, setSelector } = props
  // setSelector( () => () => selectWeapon(weaponId) )
  return ( <ItemList {...props} setItemId={setWeaponId} itemId={weaponId} items={weapons} selectItem={selectWeapon}/> )
}

export default WeaponList;
