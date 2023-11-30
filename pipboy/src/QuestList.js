import ItemList from './ItemList'

function QuestList(props) {
  const { setQuestId, questId, quests, currentQuestId } = props
  return ( <ItemList setItemId={setQuestId} itemId={questId} items={quests} currentItemId={currentQuestId}/> )
}

export default QuestList;
