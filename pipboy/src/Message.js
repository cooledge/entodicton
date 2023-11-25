import Nav from 'react-bootstrap/Nav'

function Message({ children }) {
  return (
    <div className="message w-25 lh-3 border rounded" style={ {'min-height': '100px' } }>
       { children }
    </div>
  );
}

export default Message;
