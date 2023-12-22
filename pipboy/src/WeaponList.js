import ItemList from './ItemList'

function WeaponList(props) {
  const { setWeaponId, weaponId, weapons, selectWeapon, setSelector, weaponsFilter } = props
  return ( <ItemList {...props} setItemId={setWeaponId} itemId={weaponId} items={weapons.filter(weaponsFilter)} selectItem={selectWeapon}/> )
}

export default WeaponList;
