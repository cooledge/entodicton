import logo from './logo.svg';
import './App.css';
import SRDemo from './srdemo';
import parameters from './parameters'
const { avatar } = require('ekms')

const config = avatar;

// chrome does not like me directly calling an http server from a page that loaded https. 
config.config.url = parameters.entodicton.url
config.server(parameters.thinktelligence.url, parameters.entodicton.apiKey)

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




