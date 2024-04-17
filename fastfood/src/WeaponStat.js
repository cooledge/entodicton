import ItemStat from './ItemStat'

const propertyToName = {
  damage: 'Damage', 
  fire_rate: 'Fire Rate', 
  range: 'Range', 
  accuracy: 'Accuracy', 
  weight: 'Weight', 
  value: 'Value', 
}

function WeaponStat({weaponId, weapons}) {
  if (!weaponId) {
    return (<div/>)
  }

  const data = weapons.find( (w) => w.id === weaponId )
  const stats = Object.keys(propertyToName).map( (property) => { return { name: propertyToName[property], value: data[property] } } ).filter( (stat) => stat.value )

  return (
    <ItemStat>
      { stats }
    </ItemStat>
  );
}

export default WeaponStat;
