import React, { useState, Component } from 'react';
import { Link } from 'react-router-dom';
 
function Layout({ children }) {
   const [ isOpen, setIsOpen ] = useState(false);
   const [ demoIsOpen, setDemoIsOpen ] = useState(false);
   if (window.location.href.endsWith('srdemo')) {
     return (
           <div className='layout'>
             <div>
               { this.props.children }
             </div>
           </div>
         );
   } else {
     const menuButtonStyle = {
        background: isOpen ? '#ededed' : undefined,
     }
     const style = {
        opacity: isOpen ? 1 : 0,
        visibility: isOpen ? 'visible' : 'hidden',
        position: 'absolute',
        top: '90px', // same as your nav height
        left: '90px',
        width: '200px',
        background: '#ededed',
        border: '1px solid gray',
        'text-align': 'center',
        transition: 'all 1000ms ease',
     };
     const handleDemoButton = { 
       onMouseEnter: () => {
         setIsOpen(true)
       }, 
       onMouseLeave: () => {
         setIsOpen(false) 
       }
     }
     const handleSubMenu = { 
       onMouseEnter: () => {
         setIsOpen(true)
       }, 
       onMouseLeave: () => {
         setIsOpen(false) 
       },
     }
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
                  { /* <li className="barItem"><Link to='/demo'>DEMO</Link></li> */ }
                  <li className="barItem" style={{color: 'blue', 'text-decoration': 'underline'}}{...handleDemoButton} {...menuButtonStyle}>POC's</li>
                  <div style={style} {...handleSubMenu}>
                    <div className="subMenuItem">
                      <Link to='/pipboy/' target="_blank">PIPBOY POC</Link>
                    </div>
                    <div className="subMenuItem">
                      <Link to='/fastfood/' target="_blank">FAST FOOD POC</Link>
                    </div>
                    <div className="subMenuItem">
                      <Link to='/mongo/' target="_blank">REPORT WRITER POC</Link>
                    </div>
                    <div className="subMenuItem">
                      <Link to='/tankdemo'>TANK POC</Link>
                    </div>
                  </div>
                  { /* <li className="barItem"><Link to='/tankdemo'>DEMO</Link></li> */ }
                  { /* <li className="barItem"><Link to='/pipboy/'>PIPBOY DEMO</Link></li> */ }
                  { /* <li className="barItem"><Link to='/pipboy/' target="_blank">PIPBOY</Link></li> */ }
                  { /* <li className="barItem"><Link to='/tutorial'>TUTORIAL</Link></li> */ }
                  <li className="barItem"><Link to='/videos'>VIDEOS</Link></li>
                  <li className="barItem"><Link to='/kms'>KMS</Link></li>
                  { /* <li className="barItem"><Link to='/purchase'>PURCHASE</Link></li> */ }
                  { /* <li className="barItem"><Link to='/subscriptions'>SUBSCRIPTIONS</Link></li> */ }
                  <li className="barItem"><Link to='/contact'>ABOUT</Link></li>
                  <span style={ { float: 'right', 'marginRight': '20px' } }>The Programmable Mind</span>
                </div>
                <div>
                  { children }
                </div>
             </div>
            );
   }
}

export default Layout;
