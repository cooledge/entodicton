function ItemList(props) {
  const {setItemId, itemId, items} = props

  const list = items.map((item) => {
    const className = item.id === itemId ? 'selected' : ''
    const quantity = item.quantity > 1 ? `(${item.quantity})` : ''
    return (<li><a className={className} onMouseEnter={ () => setItemId(item.id) }>{item.name}{quantity}</a></li>)
  })

  return (
    <ul className="item-list">
      {list}
    </ul>
  );
}

export default ItemList;
