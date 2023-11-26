function ApparelList(props) {
  const {setApparelId, apparel} = props

  const list = apparel.map((item) => {
    return (<li><a onMouseEnter={ () => setApparelId(item.id) } className={item.name}>{item.name}</a></li>)
  })

  return (
    <ul className="item-list">
      {list}
    </ul>
  );
}

export default ApparelList;
