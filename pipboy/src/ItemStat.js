function ItemStat({ children }) {
  const row = (name, value) => {
    return (
      <div className="row-highlight">
        <div className="row"> 
          <div className="col-12"> 
            <span className="pull-right">{value}</span>
            <div className="pull-left">{name}</div>
          </div>
        </div>
      </div>
    )
  }

  const rows = children.filter( (x) => !!x ).map( ({name, value}) => row(name, value) )
  return (
    <div className="item-stats">
      {rows}
    </div>
  );
}

export default ItemStat;
