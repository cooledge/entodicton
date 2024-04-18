const propertyToName = {
  rads: 'Rads', 
  ap: 'AP', 
  weight: 'Weight', 
  value: 'Value', 
}

function Menu() {
  if (!aidId) {
    return (<div/>)
  }
  const data = aid.find( (item) => item.id === aidId )

  const stats = Object.keys(propertyToName).map( (property) => { return { name: propertyToName[property], value: data[property] } } ).filter( (stat) => stat.value )
  if (data.percent) {
    stats.unshift({name: 'Percent', value: `${data.hp}%`})
  } else {
    stats.unshift({name: 'HP', value: data.hp})
  }

  return (
    <div>
      This is the menu
    </div>
  );
}

export default AidStat;
