import ItemList from './ItemList'

function WeaponList(props) {
  const { setWeaponId, weaponId, weapons } = props
  return ( <ItemList setItemId={setWeaponId} itemId={weaponId} items={weapons}/> )
}

export default WeaponList;
