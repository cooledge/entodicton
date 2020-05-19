import React, { Component } from 'react';
import './App.css';
import { Route, BrowserRouter } from 'react-router-dom';
import Home from './components/layouts/Home'
import About from './components/layouts/About'
import { Provider } from 'react-redux';
import store from './stores/store';
import Layout from './components/layouts/Layout';

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <BrowserRouter>
            <Layout>
                <div>
                    <Route exact path="/" component={Home} />
                    <Route path="/about" component={About} />
                </div>
            </Layout>
        </BrowserRouter>
      </Provider>
    );
  }
}

export default App;
