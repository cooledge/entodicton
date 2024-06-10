function Order({ order, total }) {
  const items = order.map( (item) => <li class="Item" key={item.index}>
        <span class="Name" style={{ 'flexGrow': '1' }}>{item.name}</span>
        <span class="Cost">${item.cost}</span>
      </li> )
  console.log(order)
  return (
    <div className="Order">
      { total > 0 &&
        <h1>Order</h1>
      }
      <ul className="Items">
        {items}
        { total > 0 &&
          <li class="Total">
            <span class='Heading' style={{ 'flexGrow': '1' }}>Total</span>
            <span class='Total'>${total}</span>
          </li>
        }
      </ul>
    </div>
  );
}

export default Order;
