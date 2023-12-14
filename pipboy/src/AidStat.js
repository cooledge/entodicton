import ItemStat from './ItemStat'

const propertyToName = {
  rads: 'Rads', 
  ap: 'AP', 
  weight: 'Weight', 
  value: 'Value', 
}

function AidStat({aidId, aid}) {
  if (!aidId) {
    return (<div/>)
  }
  const data = aid.find( (item) => item.id === aidId )

  console.log("mapping", Object.keys(propertyToName).map( (property) => { return { name: propertyToName[property], value: data[property] } } ))
  const stats = Object.keys(propertyToName).map( (property) => { return { name: propertyToName[property], value: data[property] } } ).filter( (stat) => stat.value )
  if (data.percent) {
    stats.unshift({name: 'Percent', value: `${data.hp}%`})
  } else {
    stats.unshift({name: 'HP', value: data.hp})
  }

  return (
    <ItemStat>
      { stats }
    </ItemStat>
  );
}

export default AidStat;
