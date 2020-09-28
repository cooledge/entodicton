import React, { Component } from 'react';
import './App.css';
import { Route, BrowserRouter, Redirect } from 'react-router-dom';
import Product from './components/layouts/Product'
import TankDemo from './components/TankDemo'
import Tutorial from './components/layouts/Tutorial'
import Contact from './components/layouts/About'
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
                    <Route path="/product" component={Product} />
                    <Route path="/demo" component={TankDemo} />
                    <Route path="/tutorial" component={Tutorial} />
                    <Route path="/contact" component={Contact} />
                </div>
            </Layout>
        </BrowserRouter>
      </Provider>
    );
  }
}

export default App;
