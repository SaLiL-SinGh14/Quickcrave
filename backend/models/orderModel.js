import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  cf_order_id: { type: String, index: true }, // Cashfree order id
  status: { type: String, default: "PENDING" }, // align with controller
  payment: { type: Boolean, default: false },
}, { timestamps: true }); // createdAt for sorting

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
