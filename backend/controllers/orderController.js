// controllers/orderController.js
import { Cashfree, CFEnvironment } from 'cashfree-pg';
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import axios from 'axios';

// -------- Cashfree SDK init (Sandbox) --------
const cashfree = new Cashfree(
  CFEnvironment.SANDBOX, // Sandbox as requested
  process.env.CF_APP_ID,
  process.env.CF_SECRET_KEY
);

// API version and base URL for REST calls
const CF_API_VERSION = process.env.CF_API_VERSION || '2022-09-01'; // keep consistent with your code
const CF_API_BASE = 'https://sandbox.cashfree.com'; // Sandbox base

// -------- Create Order + Payment Session --------
const handleOrderAndPayment = async (req, res) => {
  try {
    const frontend_url = process.env.FRONTEND_URL || 'http://localhost:5174';

    const { items, amount, address, email, phone } = req.body;
    if (!items?.length || !amount) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    // 1) Save local order as pending/unpaid
    const newOrder = await orderModel.create({
      userId: req.user.id,
      items,
      amount,
      address,
      payment: false,
      status: 'PENDING',
    });

    // 2) Optional: Empty cart now (or move to success)
    await userModel.findByIdAndUpdate(req.user.id, { cartData: {} });

    // 3) Create Cashfree order with correct return_url placeholder {order_id}
    const orderData = {
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: String(req.user.id),
        customer_email: email || 'test@cashfree.com',
        customer_phone: phone || '9999999999',
      },
      order_meta: {
        // Cashfree will replace {order_id} and redirect to: /verify?order_id=CF_xxx
        return_url: `${frontend_url}/verify?order_id={order_id}`,
      },
      order_note: `local_order:${newOrder._id}`,
    };

    const cfResponse = await cashfree.PGCreateOrder(orderData);
    const { order_id, payment_session_id } = cfResponse?.data || {};
    if (!order_id || !payment_session_id) {
      return res.status(502).json({ success: false, message: 'Cashfree create order failed' });
    }

    // 4) Store Cashfree order id
    newOrder.cf_order_id = order_id;
    await newOrder.save();

    // 5) Help frontend with convenience verify URL
    const return_url = `${frontend_url}/verify?order_id=${order_id}`;

    return res.json({
      success: true,
      orderId: newOrder._id,
      cf_order_id: order_id,
      payment_session_id,
      return_url,
    });
  } catch (error) {
    console.error('handleOrderAndPayment Error:', error?.response?.data || error?.message);
    return res.status(500).json({
      success: false,
      message: 'Order or Payment processing failed',
    });
  }
};

// -------- Verify payment status (called from your /verify page) --------
const verifyPayment = async (req, res) => {
  try {
    // Cashfree redirects with ?order_id=...
    const { order_id } = req.query;
    if (!order_id) {
      return res.status(400).json({ success: false, message: 'order_id is required' });
    }

    // Find local order
    const localOrder = await orderModel.findOne({ cf_order_id: order_id });
    if (!localOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Get order status from Cashfree
    const response = await axios.get(`${CF_API_BASE}/pg/orders/${order_id}`, {
      headers: {
        'x-client-id': process.env.CF_APP_ID,
        'x-client-secret': process.env.CF_SECRET_KEY,
        'x-api-version': CF_API_VERSION,
      },
    });

    const orderStatus = response?.data?.order_status || 'PENDING';

    // Sync local DB
    if (orderStatus === 'PAID' && !localOrder.payment) {
      localOrder.payment = true;
      localOrder.status = 'Food Processing';
      await localOrder.save();
    } else if (orderStatus === 'EXPIRED' || orderStatus === 'FAILED') {
      localOrder.status = orderStatus;
      await localOrder.save();
    }

    return res.json({
      success: true,
      status: orderStatus,
      orderId: localOrder._id,
    });
  } catch (error) {
    console.error('Verify Payment Error:', error?.response?.data || error?.message);
    return res.status(500).json({
      success: false,
      status: 'ERROR',
      message: 'Verification failed',
    });
  }
};

// -------- Get Cashfree Order details passthrough --------
const getOrderDetails = async (req, res) => {
  try {
    const { order_id } = req.query;
    if (!order_id) {
      return res.status(400).json({ success: false, message: 'order_id is required' });
    }

    const response = await axios.get(`${CF_API_BASE}/pg/orders/${order_id}`, {
      headers: {
        'x-client-id': process.env.CF_APP_ID,
        'x-client-secret': process.env.CF_SECRET_KEY,
        'x-api-version': CF_API_VERSION,
      },
    });

    return res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('getOrderDetails Error:', error?.response?.data || error?.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch order details' });
  }
};
const getMyOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (e) {
    console.error('getMyOrders Error:', e?.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

//listing order for admin panel
const listOrders = async (req,res)=>{
  try {
    const orders = await orderModel.find({});
    res.json({success:true,data:orders})
  } catch (error) {
    console.log(error);
    res.json({success:false,message:"Error"})
    
  }
};

const updateStatus = async(req,res) =>{
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status});
    res.json({success:true,message:"Status Updated"})
  } catch (error) {
    console.log(error);
    res.json({success:false,message:"Error"})
    
  }
}
 
   

export { handleOrderAndPayment, verifyPayment, getOrderDetails, getMyOrders,listOrders,updateStatus };
