import React, { Component } from 'react';
import { Link } from 'react-router-dom';
 
class Layout extends Component {
   render() {
         return (
                 <div>
                     <div className="App-header">
                         <h1>
                             <a href='https://www.npmjs.com/package/entodicton'>Entodicton</a> Demo Program
                         </h1>
                     </div>
                     <div>
                        { this.props.children }
                     </div>
                     <ul>
                         <li><Link to={'/'}>Home</Link></li>
                         <li><Link to={'/about'}>About</Link></li>
                     </ul>
                 </div>
                );
   }
}

export default Layout;
