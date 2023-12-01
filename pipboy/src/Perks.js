import PerkList from './PerkList'
import ItemDesc from './ItemDesc'

function Perks(props) {
  const perk = props.perks.find((s) => s.id == props.perkId)
  console.log('props.perkId', props.perkId)
  console.log('perk', perk)
  console.log('perk.max_stars', perk.max_stars)
  return (
           <div className="tab-content">
             <div className="tab-pane active full" id="status" role="tabpanel">
               <PerkList {...props} />
               <ItemDesc {...props}>
                 <p class='stars'>
                  <span class="star checked">{"*".repeat(perk.stars)}</span>
                  <span class="star unchecked">{"*".repeat(perk.max_stars-perk.stars)}</span>
                 </p>
                 {perk.description}
               </ItemDesc>
             </div>
           </div>
  );
}

export default Perks;
