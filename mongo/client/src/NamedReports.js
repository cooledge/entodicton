function NamedReports(props) {
  const { namedReports, selectNamedReport } = props

  const onClickItem = (id) => () => {
    selectNamedReport(id)
  }

  return (
    <div className="NamedReports">
      <header>Named Reports</header>
      <div className="Content">
        <div class="List">
          { namedReports.map( ({ name, selected, id }) => <div onClick={onClickItem(id)} className={selected ? "Selected Item" : "Item"} id={`Item_${id}`} key={id}>{name}</div> ) }
        </div>
      </div>
    </div>
  );
}

export default NamedReports;
