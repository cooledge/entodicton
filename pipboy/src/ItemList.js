function ItemList(props) {
  const {setItemId, itemId, items, currentItemId} = props

  const list = items.map((item) => {
    const className = item.id === itemId ? 'selected' : ''
    const quantity = item.quantity > 1 ? `(${item.quantity})` : ''
    const current = item.id === currentItemId ? "(current)": ""
    return (<li><a className={className} key={item.id} onMouseEnter={ () => setItemId(item.id) }>{item.name}{quantity}</a></li>)
  })

  return (
    <ul className="item-list">
      {list}
    </ul>
  );
}

export default ItemList;
