import logo from './logo.svg';
import './App.css';
import SRDemo from './srdemo';
import parameters from './parameters'
const { avatar, help, Config } = require('ekms')

const config = avatar;
config.add(help)

// chrome does not like me directly calling an http server from a page that loaded https. 
config.config.url = parameters.entodicton.url
config.server(parameters.thinktelligence.url, parameters.entodicton.apiKey)

//console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", JSON.stringify(config.tests, null, 2))
/*
config.process('help').then( (result) => {
  console.log('xxxxxxxxxxxxxxxxxxxxxxxx', result)
})
*/

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <SRDemo km={config}></SRDemo>
      </header>
    </div>
  );
}

export default App;




