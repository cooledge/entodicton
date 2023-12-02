function ItemList(props) {
  const {setItemId, itemId, items} = props
  const list = items.map((item) => {
    let className = item.id === itemId ? 'current ' : ''
    const quantity = item.quantity > 1 ? `(${item.quantity})` : ''
    if (item.selected) {
      className += " selected"
    }
    return (<li><a className={className} key={item.id} onMouseEnter={ () => setItemId(item.id) }>{item.name}{quantity}</a></li>)
  })

  return (
    <ul className="item-list">
      {list}
    </ul>
  );
}

export default ItemList;
