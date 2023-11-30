import QuestList from './QuestList'
// import QuestStat from './QuestStat'

//                <QuestStat {...props}/>
function Quests(props) {
  return (
            <div className="tab-content">
              <div className="tab-pane active full" id="status" role="tabpane">
                <QuestList {...props}/>
              </div>
            </div>
  );
}

export default Quests;
