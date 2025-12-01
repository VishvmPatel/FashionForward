import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { 
  BellIcon, 
  XMarkIcon,
  ShoppingBagIcon,
  UserIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  StarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const RealTimeNotifications = () => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const socketUrl = apiBaseUrl.replace('/api', '');
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('🔌 Connected to server');
      setIsConnected(true);
      
      newSocket.emit('join-admin');
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('new-order', (data) => {
      addNotification({
        id: Date.now(),
        type: 'order',
        title: 'New Order Received',
        message: `Order #${data.data.orderId.slice(-6)} from ${data.data.customerName}`,
        amount: data.data.totalAmount,
        status: data.data.status,
        timestamp: data.timestamp,
        icon: ShoppingBagIcon,
        color: 'green'
      });
    });

    newSocket.on('order-updated', (data) => {
      addNotification({
        id: Date.now(),
        type: 'order',
        title: 'Order Status Updated',
        message: `Order #${data.data.orderId.slice(-6)} status changed to ${data.data.status}`,
        customerName: data.data.customerName,
        timestamp: data.timestamp,
        icon: ShoppingBagIcon,
        color: 'blue'
      });
    });

    newSocket.on('new-user', (data) => {
      addNotification({
        id: Date.now(),
        type: 'user',
        title: 'New User Registration',
        message: `${data.data.name} registered with email ${data.data.email}`,
        timestamp: data.timestamp,
        icon: UserIcon,
        color: 'purple'
      });
    });

    newSocket.on('search-activity', (data) => {
      addNotification({
        id: Date.now(),
        type: 'search',
        title: 'Product Search',
        message: `User searched for "${data.data.searchTerm}" - ${data.data.resultsCount} results`,
        timestamp: data.timestamp,
        icon: MagnifyingGlassIcon,
        color: 'yellow'
      });
    });

    newSocket.on('product-viewed', (data) => {
      addNotification({
        id: Date.now(),
        type: 'product',
        title: 'Product Viewed',
        message: `Product ${data.data.productId.slice(-6)} was viewed`,
        timestamp: data.timestamp,
        icon: EyeIcon,
        color: 'indigo'
      });
    });

    newSocket.on('cart-activity', (data) => {
      addNotification({
        id: Date.now(),
        type: 'cart',
        title: 'Cart Activity',
        message: `${data.data.productName} ${data.data.action} from cart`,
        timestamp: data.timestamp,
        icon: ShoppingBagIcon,
        color: 'orange'
      });
    });

    newSocket.on('wishlist-activity', (data) => {
      addNotification({
        id: Date.now(),
        type: 'wishlist',
        title: 'Wishlist Activity',
        message: `${data.data.productName} ${data.data.action} from wishlist`,
        timestamp: data.timestamp,
        icon: HeartIcon,
        color: 'pink'
      });
    });

    newSocket.on('review-activity', (data) => {
      addNotification({
        id: Date.now(),
        type: 'review',
        title: 'New Product Review',
        message: `Product ${data.data.productId.slice(-6)} received ${data.data.rating} star review`,
        timestamp: data.timestamp,
        icon: StarIcon,
        color: 'amber'
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50 notifications
    setUnreadCount(prev => prev + 1);
    
    setTimeout(() => {
      removeNotification(notification.id);
    }, 10000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  const getIconColor = (color) => {
    const colors = {
      green: 'text-green-500',
      blue: 'text-blue-500',
      purple: 'text-purple-500',
      yellow: 'text-yellow-500',
      indigo: 'text-indigo-500',
      orange: 'text-orange-500',
      pink: 'text-pink-500',
      amber: 'text-amber-500'
    };
    return colors[color] || 'text-gray-500';
  };

  const getBgColor = (color) => {
    const colors = {
      green: 'bg-green-50 border-green-200',
      blue: 'bg-blue-50 border-blue-200',
      purple: 'bg-purple-50 border-purple-200',
      yellow: 'bg-yellow-50 border-yellow-200',
      indigo: 'bg-indigo-50 border-indigo-200',
      orange: 'bg-orange-50 border-orange-200',
      pink: 'bg-pink-50 border-pink-200',
      amber: 'bg-amber-50 border-amber-200'
    };
    return colors[color] || 'bg-gray-50 border-gray-200';
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return time.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => {
          setShowNotifications(!showNotifications);
          markAsRead();
        }}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-full"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {/* Connection Status Indicator */}
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} title={isConnected ? 'Connected' : 'Disconnected'} />
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Live Activity</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Real-time updates from your website
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <BellIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No recent activity</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const IconComponent = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 ${getBgColor(notification.color)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 ${getIconColor(notification.color)}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        {notification.amount && (
                          <p className="text-sm font-semibold text-green-600 mt-1">
                            ₹{notification.amount.toLocaleString()}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setNotifications([])}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RealTimeNotifications;
