import React, { Component } from 'react';
import './App.css';
import { Route, BrowserRouter, Redirect } from 'react-router-dom';
import Product from './components/layouts/Product'
import Tutorial from './components/layouts/Tutorial'
import Videos from './components/layouts/Videos'
import TankDemo from './components/TankDemo'
import KMs from './components/layouts/KMs'
import Config from './components/layouts/Config'
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
                    <Route exact path="/" component={Product} />
                    <Route path="/product" component={Product} />
                    <Route path="/tutorial" component={Tutorial} />
                    <Route path="/tankdemo" component={TankDemo} />
                    <Route path="/videos" component={Videos} />
                    <Route path="/kms" component={KMs} />
                    <Route path="/config" component={Config} />
                    <Route path="/contact" component={Contact} />
                </div>
            </Layout>
        </BrowserRouter>
      </Provider>
    );
  }
}

export default App;
