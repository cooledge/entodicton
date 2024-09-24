import { useState } from 'react'

function Chooser(props) {
  const { title, choices, setChoices, setChosen, ordered } = props
  let counter
  const counters = choices.filter((choice) => choice.counter).map( (choice) => choice.counter )
  if (counters.length == []) {
    counter = 1
  }
  else {
    counter = Math.max(...counters) + 1
  }

  const onClickItem = (id) => () => {
    const update = choices.map( (choice) => {
      if (choice.id === id) {
        const updated = {...choice, selected: choice.selected ? false : true}
        if (ordered) {
          if (updated.selected) {
            updated.counter = counter
          } else {
            updated.counter = null
          }
        }
        return updated
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
          { choices.map( ({text, id, selected, counter}) => {
            if (ordered && counter) {
              text = `${text} (${counter})`
            }
            return <div onClick={onClickItem(id)} className={selected ? "ChooserSelected ChooserItem" : "ChooserItem"} id={`ChooserItem_${id}`} key={id}>
                {text}
              </div> 
          })}
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
