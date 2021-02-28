import React, { Component } from 'react';
import { Link } from 'react-router-dom';
 
class Layout extends Component {
   render() {
         return (
                 <div className='layout'>
                    <div className="logo">
                      <div className='name'>
                        THINKtelligence
                      </div>
                    </div>
                    <div className='menuBar'>
                      <li className="barItem"><Link to='/product'>PRODUCT</Link></li>
                      <li className="barItem"><Link to='/demo'>DEMO</Link></li>
                      <li className="barItem"><Link to='/tutorial'>TUTORIAL</Link></li>
                      <li className="barItem"><Link to='/videos'>VIDEOS</Link></li>
                      <li className="barItem"><Link to='/purchase'>PURCHASE</Link></li>
                      <li className="barItem"><Link to='/subscriptions'>SUBSCRIPTIONS</Link></li>
                      <li className="barItem"><Link to='/contact'>ABOUT</Link></li>
                    </div>
                   <div>
                     { this.props.children }
                   </div>
                 </div>
                );
   }
}

export default Layout;
