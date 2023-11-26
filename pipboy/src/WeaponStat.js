import ItemStat from './ItemStat'

function WeaponStat({weaponId, weapons}) {
  if (!weaponId) {
    return (<div/>)
  }

  const data = weapons.find( (w) => w.id === weaponId )

  return (
    <ItemStat>
      { {name: 'Damage', value: data.damage} }
      { {name: 'Fire Rate', value: data.fire_rate} } 
      { {name: 'Range', value: data.range} } 
      { {name: 'Accuracy', value: data.accuracy} } 
      { {name: 'Weight', value: data.weight} } 
      { {name: 'Value', value: data.value} }
    </ItemStat>
  );
}

export default WeaponStat;
