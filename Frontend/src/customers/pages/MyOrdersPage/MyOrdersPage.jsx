import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import apiService from '../../../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = API_BASE_URL.replace('/api', '');
import {
  ClipboardDocumentListIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  CalendarIcon,
  MapPinIcon,
  CreditCardIcon,
  ArrowPathIcon,
  CubeIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const MyOrdersPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    console.log('MyOrdersPage - isAuthenticated:', isAuthenticated);
    console.log('MyOrdersPage - user:', user);
    console.log('MyOrdersPage - token:', localStorage.getItem('token'));
    
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOrders();
      if (response.success) {
        setOrders(response.data.orders);
      } else {
        setError(response.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return <ClockIcon className="w-5 h-5 text-gray-500" />;
    switch (status.toLowerCase()) {
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircleIcon className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <TruckIcon className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleReorder = async (order) => {
    try {
      // Add all items from the order back to cart
      for (const item of order.items) {
        // This would need to be implemented in the cart context
        console.log('Adding to cart:', item);
      }
      alert('Items added to cart for reorder!');
    } catch (error) {
      console.error('Error reordering:', error);
      alert('Failed to reorder. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl max-w-md w-full">
          <ClipboardDocumentListIcon className="w-32 h-32 text-purple-300 mx-auto mb-8" />
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-xl text-gray-600 mb-8">
            Please sign in to view your order history.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-spin" />
          <p className="text-xl text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl max-w-md w-full">
          <XCircleIcon className="w-32 h-32 text-red-300 mx-auto mb-8" />
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Error Loading Orders</h1>
          <p className="text-xl text-gray-600 mb-8">{error}</p>
          <button
            onClick={fetchOrders}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            <ArrowPathIcon className="w-6 h-6 mr-3" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl max-w-md w-full">
          <CubeIcon className="w-32 h-32 text-purple-300 mx-auto mb-8" />
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">No Orders Yet</h1>
          <p className="text-xl text-gray-600 mb-8">
            You haven't placed any orders yet. Start shopping to see your orders here!
          </p>
          <Link
            to="/all-products"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            <CubeIcon className="w-6 h-6 mr-3" />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            My Orders
          </h1>
          <p className="text-xl text-gray-700">
            Track and manage your order history
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.orderStatus)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Order #{order.orderNumber}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Ordered: {formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CubeIcon className="w-4 h-4" />
                      <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CreditCardIcon className="w-4 h-4" />
                      <span>₹{order.total}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleViewOrderDetails(order)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                  >
                    <EyeIcon className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  {order.orderStatus && order.orderStatus.toLowerCase() === 'delivered' && (
                    <button
                      onClick={() => handleReorder(order)}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-sm font-medium"
                    >
                      <ArrowPathIcon className="w-4 h-4 mr-2" />
                      Reorder
                    </button>
                  )}
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4 overflow-x-auto">
                  {order.items.slice(0, 4).map((item, index) => (
                    <div key={index} className="flex-shrink-0">
                      <img
                        src={item.image ? (item.image.startsWith('http') ? item.image : `${BACKEND_URL}${item.image}`) : '/images/default-product.jpg'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        +{order.items.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Order Details - #{selectedOrder.orderNumber}
                </h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                        <img
                          src={item.image ? (item.image.startsWith('http') ? item.image : `${BACKEND_URL}${item.image}`) : '/images/default-product.jpg'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-600">Size: {item.size || 'Default'}</p>
                          <p className="text-sm text-gray-600">Color: {item.color || 'Default'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{item.price}</p>
                          <p className="text-sm text-gray-600">Total: ₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                      <div className="text-sm text-gray-600">
                        <p>{selectedOrder.shippingAddress?.fullName}</p>
                        <p>{selectedOrder.shippingAddress?.address}</p>
                        <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                        <p>{selectedOrder.shippingAddress?.pincode}</p>
                        <p>{selectedOrder.shippingAddress?.country}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-medium text-gray-900 mb-2">Payment Method</h4>
                      <p className="text-sm text-gray-600">
                        {selectedOrder.payment?.method === 'stripe' ? 'Credit/Debit Card' : 'Cash on Delivery'}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Subtotal:</span>
                        <span>₹{selectedOrder.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Shipping:</span>
                        <span>₹{selectedOrder.shippingCost}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Tax:</span>
                        <span>₹{selectedOrder.tax}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>₹{selectedOrder.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
