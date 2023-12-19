function ItemList(props) {
  const {setItemId, itemId, items, selectItem = () => {} } = props
  const list = items.map((item) => {
    let className = item.id === itemId ? 'current ' : ''
    const quantity = item.quantity > 1 ? `(${item.quantity})` : ''
    if (item.selected) {
      className += " selected"
    }
    return (<li id={item.id} key={item.id}>
              <a 
                className={className} 
                onMouseEnter={ () => setItemId(item.id) }
                onClick={ () => selectItem(item.id) }
              >
                {item.name}{quantity}
              </a>
           </li>)
  })

  return (
    <ul className="item-list">
      {list}
    </ul>
  );
}

export default ItemList;
