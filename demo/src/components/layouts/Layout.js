import React, { Component } from 'react';
import { Link } from 'react-router-dom';
 
class Layout extends Component {
   render() {
         return (
                 <div className='layout'>
                    <ul>
                      <li className="barItem"><Link to='/product'>PRODUCT</Link></li>
                      <li className="barItem"><Link to='/demo'>DEMO</Link></li>
                      <li className="barItem"><Link to='/tutorial'>TUTORIAL</Link></li>
                      <li className="barItem"><Link to='/purchase'>PURCHASE</Link></li>
                      { /* <li className="barItem"><Link to='/contact'>CONTACT</Link></li> */ }
                    </ul>
                    <div className="logo">
                      <div className='name'>
                        THINKtelligence
                      </div>
                    </div>
                   <div>
                     { this.props.children }
                   </div>
                 </div>
                );
   }
}

export default Layout;
