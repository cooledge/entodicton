function Chooser(props) {
  const { title, choices, setChoices, setChosen } = props

  const onClickItem = (id) => () => {
    const update = choices.map( (choice) => {
      if (choice.id === id) {
        return {...choice, selected: choice.selected ? false : true}
      }
      return choice
    })
    console.log('update', update)
    setChoices(update)
  }

  const onClickButton = (id) => () => {
    setChosen(id)
  }

  return (
    <div className="Chooser">
      <div className="Content">
        <header>{title}</header>
        <div class="ChooserList">
          { choices.map( ({text, id, selected}) => <div onClick={onClickItem(id)} className={selected ? "ChooserSelected ChooserItem" : "ChooserItem"} id={`ChooserItem_${id}`} key={id}>{text}</div> ) }
        </div>
        <div className="Buttons">
          <span className="ChooserButton ChooserButtonCancel" onClick={onClickButton("cancel")}>Cancel</span>
          <span className="ChooserButton ChooserButtonSelect" onClick={onClickButton("select")}>Select</span>
        </div>
      </div>
    </div>
  );
}

export default Chooser;
