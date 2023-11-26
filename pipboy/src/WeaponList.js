import ItemList from './ItemList'

function WeaponList({ setWeapon, weapon, weapons }) {
  return ( <ItemList setItemId={setWeapon} itemId={weapon} items={weapons}/> )
}

export default WeaponList;
