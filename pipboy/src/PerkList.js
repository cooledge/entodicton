function PerkList(props) {
  const {setPerkId, perks} = props

  const list = perks.map((item) => {
    return (<li><a onMouseEnter={ () => setPerkId(item.id) } className={item.name}>{item.name}</a></li>)
  })

  return (
    <ul className="item-list">
      {list}
    </ul>
  );
}

export default PerkList;
