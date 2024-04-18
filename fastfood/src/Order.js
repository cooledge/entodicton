function Order({ order }) {
  const items = order.map( (item) => <li class="Item" key={item.name}>
        <span class="Name" style={{ 'flexGrow': '1' }}>{item.name}</span>
        <span class="Cost">${item.cost}</span>
      </li> )
  return (
    <div className="Order">
      <h1>Order</h1>
      <ul className="Items">
        {items}
      </ul>
    </div>
  );
}

export default Order;
