function SpecialList(props) {
  const {setSpecialId, special} = props

  const list = special.map((item) => {
    return (<li><a onMouseEnter={ () => setSpecialId(item.id) } className={item.name}>{item.name}</a></li>)
  })

  return (
    <ul className="item-list">
      {list}
    </ul>
  );
}

export default SpecialList;
