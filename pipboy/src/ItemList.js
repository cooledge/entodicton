function ItemList(props) {
  const {setItemId, itemId, items} = props

  const list = items.map((item) => {
    const className = item.id === itemId ? 'selected' : ''
    debugger
    return (<li><a className={className} onMouseEnter={ () => setItemId(item.id) }>{item.name}</a></li>)
  })

  return (
    <ul className="item-list">
      {list}
    </ul>
  );
}

export default ItemList;
