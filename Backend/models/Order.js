const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    required: false,
    default: '/images/default-product.jpg'
  },
  size: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: null
  }
});

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: false,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [OrderItemSchema],
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  billingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'cod'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true
  },
  shipping: {
    type: Number,
    required: true,
    default: 0
  },
  tax: {
    type: Number,
    required: true,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  orderNotes: {
    type: String,
    default: ''
  },
  trackingNumber: {
    type: String,
    default: null
  },
  estimatedDelivery: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
OrderSchema.index({ user: 1, createdAt: -1 });
// Note: orderNumber already has an index from unique: true, so we don't duplicate it here
OrderSchema.index({ orderStatus: 1 });

// Pre-save middleware to generate order number and update timestamps
OrderSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate unique order number
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `ORD${year}${month}${day}${random}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Instance method to get order summary
OrderSchema.methods.getOrderSummary = function() {
  return {
    orderNumber: this.orderNumber,
    total: this.total,
    status: this.orderStatus,
    itemCount: this.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: this.createdAt
  };
};

// Instance method to get shipping address as string
OrderSchema.methods.getShippingAddressString = function() {
  const addr = this.shippingAddress;
  return `${addr.address}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
};

// Instance method to get billing address as string
OrderSchema.methods.getBillingAddressString = function() {
  const addr = this.billingAddress;
  return `${addr.address}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
};

// Static method to get order statistics
OrderSchema.statics.getOrderStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' }
      }
    }
  ]);
  
  return stats[0] || { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 };
};

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;