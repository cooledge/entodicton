function ItemList(props) {
  const {setItemId, itemId, items, currentItemId} = props
  console.log('currentItemId-----------------', currentItemId)
  const list = items.map((item) => {
    let className = item.id === itemId ? 'current ' : ''
    const quantity = item.quantity > 1 ? `(${item.quantity})` : ''
    if (item.selected) {
      className += " equipped"
    }
    console.log('---- className ----', className)
    return (<li><a className={className} key={item.id} onMouseEnter={ () => setItemId(item.id) }>{item.name}{quantity}</a></li>)
  })

  return (
    <ul className="item-list">
      {list}
    </ul>
  );
}

export default ItemList;
