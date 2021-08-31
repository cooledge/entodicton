import logo from './logo.svg';
import './App.css';
import SRDemo from './srdemo';
const { avatar } = require('ekms')

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
