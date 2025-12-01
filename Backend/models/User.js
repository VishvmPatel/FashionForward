/**
 * User Model - Fashion Forward E-commerce
 * 
 * This model defines the user schema for the Fashion Forward application.
 * It handles user authentication, profile management, and account security.
 * 
 * Features:
 * - User registration and authentication
 * - Password hashing with bcrypt
 * - Account security (lockout, verification)
 * - Profile management
 * - Role-based access control (user, customer, admin)
 * - Google OAuth integration support
 * 
 * @author Fashion Forward Development Team
 * @version 1.0.0
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema Definition
 * 
 * Defines the structure and validation rules for user documents.
 * Includes personal information, authentication data, and security settings.
 */
const userSchema = new mongoose.Schema({
  // Personal Information Fields
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  // Authentication Fields
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password not required if user signed up with Google
    },
    minlength: [6, 'Password must be at least 6 characters long']
  },
  
  // Google OAuth Integration Fields
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  googleEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  
  // Contact Information
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  
  // Personal Details
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  },
  
  // Address Management - Array of user addresses
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    fullName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    addressLine1: {
      type: String,
      required: true
    },
    addressLine2: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true,
      match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode']
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  
  // User Shopping Data
  wishlist: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  
  // Email Verification System
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Password Reset System
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Role-Based Access Control
  role: {
    type: String,
    enum: ['user', 'customer', 'admin'],
    default: 'user'
  },
  
  // Account Status and Security
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date // Account lockout timestamp
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

/**
 * Database Indexes
 * 
 * These indexes improve query performance for frequently accessed fields.
 * Note: email already has an index from unique: true, so we don't duplicate it here.
 */
userSchema.index({ 'addresses.pincode': 1 }); // Index for address-based queries

/**
 * Virtual Properties
 * 
 * These are computed properties that are not stored in the database
 * but are calculated when accessed.
 */

// Virtual for full name - combines first and last name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status - checks if account is currently locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

/**
 * Pre-save Middleware
 * 
 * This middleware runs before saving a user document.
 * It handles password hashing with security checks.
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Check if password is already hashed (starts with $2a$ or $2b$)
    // This prevents double-hashing during updates
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
      return next(); // Password is already hashed, skip hashing
    }

    // Hash password with cost of 12 (high security)
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance Methods
 * 
 * These methods are available on individual user documents.
 */

// Method to compare password with stored hash
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to increment login attempts and handle account lockout
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts after successful login
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Method to transform JSON output and remove sensitive fields
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.emailVerificationExpires;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.loginAttempts;
  delete userObject.lockUntil;
  return userObject;
};

/**
 * Static Methods
 * 
 * These methods are available on the User model itself, not on instances.
 */

// Static method to find user by email (case-insensitive)
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Export User Model
 * 
 * Creates and exports the User model for use in other parts of the application.
 */
module.exports = mongoose.model('User', userSchema);
