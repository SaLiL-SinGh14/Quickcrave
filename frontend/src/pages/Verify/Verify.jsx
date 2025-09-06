import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Verify.css';

const Verify = () => {
  const [status, setStatus] = useState('Verifying payment...');
  const [loading, setLoading] = useState(true);
  const [statusType, setStatusType] = useState('info'); // success | error | warning | info

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const order_id = query.get('order_id'); // Cashfree sends ?order_id=...

    if (!order_id) {
      setStatus('❌ Invalid order ID.');
      setStatusType('error');
      setLoading(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 3;

    const verify = async () => {
      try {
        const resp = await axios.get(
          `https://quickcrave-backend-9aop.onrender.com/api/order/verify?order_id=${order_id}`,
          { headers: { token: localStorage.getItem('token') } }
        );

        console.log('Verify API resp:', resp.status, resp.data);

        if (!resp.data?.success) {
          setStatus('❌ Verification failed. Please contact support.');
          setStatusType('error');
        } else {
          const s = resp.data.status;
          if (s === 'PAID') {
            setStatus('✅ Payment Successful! Your order is confirmed.');
            setStatusType('success');
          } else if (s === 'FAILED' || s === 'EXPIRED') {
            setStatus('❌ Payment Failed. Please try again.');
            setStatusType('error');
          } else {
            // PENDING/PROCESSING
            attempts += 1;
            if (attempts <= maxAttempts) {
              setStatus(`⏳ Waiting for confirmation... (try ${attempts}/${maxAttempts})`);
              setStatusType('warning');
              setTimeout(verify, 3000);
            } else {
              setStatus('⚠️ Still pending. Please check My Orders later.');
              setStatusType('warning');
            }
          }
        }
      } catch (err) {
        console.error('Verification Error:', err?.response?.status, err?.response?.data || err?.message);
        setStatus('❌ Verification failed. Please contact support.');
        setStatusType('error');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, []);

  return (
    <div className="verify-container">
      <div className="verify-card">
        {loading ? (
          <h2 className="verify-text info">⏳ Verifying your payment...</h2>
        ) : (
          <h2 className={`verify-text ${statusType}`}>{status}</h2>
        )}
        <p className="verify-subtext">
          Please wait while we confirm your payment with Cashfree.
        </p>
      </div>
    </div>
  );
};

export default Verify;
