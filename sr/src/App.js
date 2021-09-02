import logo from './logo.svg';
import './App.css';
import SRDemo from './srdemo';
import parameters from './parameters'
const { avatar } = require('ekms')

// chrome does not like me directly calling an http server from a page that loaded https. 
//avatar.server('https://thinktelligence.com')
avatar.server(parameters.thinktelligence.url)

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <SRDemo km={avatar}></SRDemo>
      </header>
    </div>
  );
}

export default App;




