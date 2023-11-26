import ItemStat from './ItemStat'

function WeaponStat({weapon, weapons}) {
  if (!weapon) {
    return (<div/>)
  }

  const data = weapons.find( (w) => w.id === weapon )

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
