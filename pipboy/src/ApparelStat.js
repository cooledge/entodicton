import ItemStat from './ItemStat'

const propertyToName = {
  dmg_resist: 'Damage Resitance', 
  rad_resist: 'Rad Resistance', 
  CHR: 'CHR', 
  LCK: 'LCK', 
  PER: 'PER', 
  weight: 'Weight', 
  value: 'Value', 
}

function ApparelStat({apparelId, apparel}) {
  if (!apparelId) {
    return (<div/>)
  }

  const data = apparel.find( (item) => item.id === apparelId )

  const stats = Object.keys(propertyToName).map( (property) => { return { name: propertyToName[property], value: data[property] } } ).filter( (stat) => stat.value )

  return (
    <ItemStat>
      { stats } 
    </ItemStat>
  );
}

export default ApparelStat;
