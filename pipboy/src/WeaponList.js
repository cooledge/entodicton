function WeaponList(props) {
  const {setWeapon, weapons} = props

  const list = weapons.map((item) => {
    return (<li><a onMouseEnter={ () => setWeapon(item.id) } className={item.name}>{item.name}</a></li>)
  })

  return (
    <ul className="item-list">
      {list}
    </ul>
  );
}

export default WeaponList;
