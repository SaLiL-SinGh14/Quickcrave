import React, { useContext, useState, useEffect } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../components/context/StoreContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext);

  const navigate = useNavigate();

  useEffect(()=>{
    if(!token){
      navigate('/cart')
    }
    else if(getTotalCartAmount()===0){
      navigate('/cart')
    }
  },[token])


  const [data, setData] = useState({
    firstName: '', lastName: '', email: '', street: '',
    city: '', state: '', zipcode: '', country: '', phone: '',
  });
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Load Cashfree SDK v3
  useEffect(() => {
    if (window.Cashfree) { setSdkLoaded(true); return; }
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => setSdkLoaded(true);
    script.onerror = () => setSdkLoaded(false);
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!sdkLoaded) { alert('Payment SDK not loaded.'); return; }

    // Build order items from cart
    const orderItems = food_list
      .filter(i => cartItems[i._id] > 0)
      .map(i => ({
        id: i._id,
        name: i.name,
        price: i.price,
        quantity: cartItems[i._id],
        image: i.image
      }));

    if (orderItems.length === 0) {
      alert('Cart is empty.');
      return;
    }

    const total = getTotalCartAmount();
    const deliveryFee = total === 0 ? 0 : 2;
    const payable = total + deliveryFee;

    if (payable <= 0) {
      alert('Invalid amount.');
      return;
    }

    const orderPayload = {
      address: data,
      items: orderItems,
      amount: payable,
      email: data.email,
      phone: data.phone,
    };

    setIsLoading(true);
    setStatusMessage('Processing your order...');

    try {
      // Create order + get Cashfree payment session
      const resp = await axios.post(
        `${url}/api/order/place`,
        orderPayload,
        { headers: { token } }
      );

      if (!resp.data?.success) {
        setStatusMessage('Payment initialization failed.');
        return;
      }

      const { payment_session_id } = resp.data;

      if (!payment_session_id) {
        console.error('Missing payment_session_id:', resp.data);
        setStatusMessage('Payment session missing.');
        return;
      }

      // Open Cashfree checkout (Sandbox mode)
      const cashfree = new window.Cashfree({ mode: 'sandbox' });
      const result = await cashfree.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget: '_self', // on completion, Cashfree redirects to your return_url
      });

      // If any immediate error occurs before redirect
      if (result?.error) {
        console.error('Cashfree checkout error:', result.error);
        setStatusMessage('Payment could not start. Try again.');
      }
      // No manual redirect required

    } catch (err) {
      console.error('PlaceOrder Error:', err?.response?.data || err?.message);
      setStatusMessage('Failed to place order.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={placeOrder} className="place-order">
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input required name="firstName" value={data.firstName} onChange={onChangeHandler} placeholder="First Name" />
          <input required name="lastName" value={data.lastName} onChange={onChangeHandler} placeholder="Last Name" />
        </div>
        <input required name="email" value={data.email} onChange={onChangeHandler} placeholder="Email" />
        <input required name="street" value={data.street} onChange={onChangeHandler} placeholder="Street" />
        <div className="multi-fields">
          <input required name="city" value={data.city} onChange={onChangeHandler} placeholder="City" />
          <input required name="state" value={data.state} onChange={onChangeHandler} placeholder="State" />
        </div>
        <div className="multi-fields">
          <input required name="zipcode" value={data.zipcode} onChange={onChangeHandler} placeholder="Zip code" />
          <input required name="country" value={data.country} onChange={onChangeHandler} placeholder="Country" />
        </div>
        <input required name="phone" value={data.phone} onChange={onChangeHandler} placeholder="Phone" />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div className="cart-total-details"><p>SubTotal</p><p>₹{getTotalCartAmount()}</p></div>
          <div className="cart-total-details"><p>Delivery Fee</p><p>₹{getTotalCartAmount() === 0 ? 0 : 2}</p></div>
          <div className="cart-total-details"><b>Total</b><b>₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b></div>
          <button type="submit" disabled={isLoading || !sdkLoaded}>{isLoading ? 'Processing...' : 'PROCEED TO PAYMENT'}</button>
        </div>
      </div>

      {statusMessage && <p className="status-message">{statusMessage}</p>}
    </form>
  );
};

export default PlaceOrder;
