function Order({ order, total }) {
  const items = order.map( (item) => <li class="Item" key={item.index}>
        <span class="Name" style={{ 'flexGrow': '1' }}>{item.name}</span>
        <span class="Cost">${item.cost}</span>
      </li> )
  return (
    <div className="Order">
      <h1>Order</h1>
      <ul className="Items">
        {items}
        <li class="Total">
          <span class='Heading' style={{ 'flexGrow': '1' }}>Total</span>
          <span class='Cost'>${total}</span>
        </li>
      </ul>
    </div>
  );
}

export default Order;
