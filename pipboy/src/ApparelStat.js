import ItemStat from './ItemStat'

function ApparelStat({apparelId, apparel}) {
  if (!apparelId) {
    return (<div/>)
  }

  const data = apparel.find( (item) => item.id === apparelId )

  return (
    <ItemStat>
      { {name: 'Damage Resitance', value: data.dmg_resist} }
      { {name: 'Rad Resistance', value: data.rad_resist} } 
      { {name: 'CHR', value: data.CHR} } 
      { {name: 'LCK', value: data.LCK} } 
      { {name: 'PER', value: data.PER} } 
      { {name: 'Weight', value: data.weight} } 
      { {name: 'Value', value: data.value} } 
    </ItemStat>
  );
}

export default ApparelStat;
