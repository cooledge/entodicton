function NoSessionError(props) {
  const { max, ttl} = props

  return (
    <div className="NoSessionError">
      <div className="Content">
        <header>There are no sessions available on the server</header>
        <div>
          The maximum number of sessions is {max}. The TTL is {ttl/1000/60} minutes. Refreshing the page will make another attempt at getting a session. 
        </div>
      </div>
    </div>
  );
}

export default NoSessionError;
