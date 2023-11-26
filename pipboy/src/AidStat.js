import ItemStat from './ItemStat'

function AidStat({aidId, aid}) {
  if (!aidId) {
    return (<div/>)
  }
  const data = aid.find( (item) => item.id === aidId )

  return (
    <ItemStat>
      { !data.percent && {name: 'HP', value: data.hp} }
      { data.percent && {name: 'Percent', value: `${data.hp}%`} } 
      { {name: 'Rads', value: data.rads} } 
      { {name: 'AP', value: data.ap} } 
      { {name: 'Weight', value: data.weight} } 
      { {name: 'Value', value: data.value} } 
    </ItemStat>
  );
}

export default AidStat;
