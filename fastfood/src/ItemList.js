function ItemList(props) {
  const {setSelector, setItemId, itemId, items, selectItem = () => {} } = props
  if (!items.find((item) => item.id === itemId)) {
    setItemId(items[0].id)
    return
  }
  const list = items.map((item) => {
    let className = item.id === itemId ? 'current ' : ''
    const quantity = item.quantity > 1 ? `(${item.quantity})` : ''
    if (item.selected) {
      className += " selected"
    }
    return (<li key={item.id}>
              <a 
                id={item.id} 
                className={className} 
                onMouseEnter={ () => setItemId(item.id) }
                onClick={ () => selectItem(item.id) }
              >
                {item.name}{quantity}
              </a>
           </li>)
  })

  if (setSelector) {
    setSelector( () => (unselect) => selectItem(itemId, unselect) )
  }

  return (
    <ul className="item-list">
      {list}
    </ul>
  );
}

export default ItemList;
