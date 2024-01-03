function SpecialList({ specialId:itemId, setSpecialId:setItemId, special:items }) {
  const list = items.map((item) => {
    const className = item.id === itemId ? 'current ' : ''
    return (
            <li className="special special" key={item.id} onMouseEnter={ () => setItemId(item.id) }>
              <a id={item.id} className={className}>
                <span class="specialName">{item.name}</span>
              </a>
                <span class='specialValue'>{item.value}</span>
            </li>
           )
  })

  return (
    <ul className="item-list special-list">
      {list}
    </ul>
  );
}

export default SpecialList;
