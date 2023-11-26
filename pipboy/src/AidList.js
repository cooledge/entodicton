function AidList(props) {
  const {setAidId, aid} = props

  const list = aid.map((item) => {
    return (<li><a onMouseEnter={ () => setAidId(item.id) } className={item.name}>{item.name}</a></li>)
  })

  return (
    <ul className="item-list">
      {list}
    </ul>
  );
}

export default AidList;
