import PerkList from './PerkList'
import ItemDesc from './ItemDesc'

function Perks(props) {
  return (
            <div className="tab-content">
              <div className="tab-pane active full" id="status" role="tabpanel">
                <PerkList {...props} />
                <ItemDesc {...props}>
                  {props.perks.find((s) => s.id == props.perkId).description}
                </ItemDesc>
              </div>
            </div>
  );
}

export default Perks;
