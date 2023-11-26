import PerkList from './PerkList'

function Perks(props) {
  return (
            <div className="tab-content">
              <div className="tab-pane active full" id="status" role="tabpanel">
                <PerkList {...props} />
              </div>
            </div>
  );
}

export default Perks;
