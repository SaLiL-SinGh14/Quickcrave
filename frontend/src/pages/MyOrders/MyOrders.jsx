import React, { useEffect, useState, useContext, useMemo } from 'react';
import axios from 'axios';
import './MyOrders.css';
import { StoreContext } from '../../components/context/StoreContext';
import { assets } from '../../assets/assets';

const ItemSummary = ({ items = [] }) => {
  const text = useMemo(() => {
    return items.map(it => `${it.name} x ${it.quantity}`).join(', ');
  }, [items]);
  return <span className="summary">{text}</span>;
};

const StatusBadge = ({ status = 'PENDING' }) => {
  const s = String(status).toLowerCase(); // pending/completed/failed/expired/food processing
  return (
    <span className={`status-badge ${s}`}>
      <span className="dot" />
      {status}
    </span>
  );
};

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const resp = await axios.get(`${url}/api/order/my`, { headers: { token } });
      if (resp.data?.success) setOrders(resp.data.orders || []);
    } catch (e) {
      console.error('Fetch orders error:', e?.response?.data || e?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  if (loading) return <div className="myorders"><p>Loading orders...</p></div>;
  if (!orders.length) return <div className="myorders"><p>No orders found.</p></div>;

  const getTotalItems = (items = []) => items.reduce((sum, it) => sum + (it.quantity || 0), 0);
  
//   useEffect(()=>{
//     if(!token){
//         setOrders([]);
//         setLoading(false);
//         return;
//     }
//     setLoading(true);
//     fetchOrders();

//   },[token]);

  return (
    <div className="myorders">
      <h2>My Orders</h2>

      {orders.map(o => (
        <div key={o._id} className="order-row">
          {/* left icon */}
          <div className="order-left">
            <img src={assets.parcel_icon} alt="Order" className='box-icon'>
          </img>
          </div>

          {/* middle content */}
          <div className="order-mid">
            <div className="order-line">
              <ItemSummary items={o.items} />
            </div>
          </div>

          {/* right content */}
          <div className="order-right">
            <div className="money">₹{o.amount}</div>
            <div className="muted">Items: {getTotalItems(o.items)}</div>
            <StatusBadge status={o.status || (o.payment ? 'COMPLETED' : 'PENDING')} />
          </div>

          {/* CTA */}
          <div className="order-cta">
            <button onChange={fetchOrders} className="track-btn" type="button">Track Order</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyOrders;
