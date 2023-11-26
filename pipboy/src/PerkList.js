function PerkList(props) {
  const {setPerkId, perkId, perks} = props

  const list = perks.map((item) => {
    const className = item.id == perkId ? 'selected' : ''
    debugger
    return (<li><a className={className} onMouseEnter={ () => setPerkId(item.id) }>{item.name}</a></li>)
  })

  return (
    <ul className="item-list">
      {list}
    </ul>
  );
}

export default PerkList;
