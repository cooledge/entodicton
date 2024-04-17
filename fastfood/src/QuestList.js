import ItemList from './ItemList'

function QuestList(props) {
  const { setQuestId, questId, quests } = props
  return ( <ItemList setItemId={setQuestId} itemId={questId} items={quests}/> )
}

export default QuestList;
