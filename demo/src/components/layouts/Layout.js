import React, { Component } from 'react';
import { Link } from 'react-router-dom';
 
class Layout extends Component {
   render() {
     if (window.location.href.endsWith('srdemo')) {
       return (
             <div className='layout'>
               <div>
                 { this.props.children }
               </div>
             </div>
           );
     } else {
       return (
               <div className='layout'>
                  <div className="logo">
                    <div className='name'>
                      THINKtelligence
                    </div>
                    <div className='motto'>
                    code from the future, today
                    </div>
                  </div>
                  <div className='menuBar'>
                    <li className="barItem"><Link to='/product'>PRODUCT</Link></li>
                    <li className="barItem"><Link to='/tankdemo'>DEMO</Link></li>
                    { /* <li className="barItem"><Link to='/sr' target="_blank">SRDEMO</Link></li> */ }
                    <li className="barItem"><Link to='/tutorial'>TUTORIAL</Link></li>
                    <li className="barItem"><Link to='/videos'>VIDEOS</Link></li>
                    <li className="barItem"><Link to='/kms'>KMS</Link></li>
                    { /* <li className="barItem"><Link to='/purchase'>PURCHASE</Link></li> */ }
                    { /* <li className="barItem"><Link to='/subscriptions'>SUBSCRIPTIONS</Link></li> */ }
                    <li className="barItem"><Link to='/contact'>ABOUT</Link></li>
                    <span style={ { float: 'right', 'marginRight': '20px' } }>The Programmable Mind</span>
                  </div>
                  <div>
                    { this.props.children }
                  </div>
               </div>
              );
     }
   }
}

export default Layout;
