const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true,
    length: 6
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 300 // 5 minutes TTL
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better performance
otpSchema.index({ email: 1 });
// Note: expiresAt already has a TTL index from expires: 300, so we don't duplicate it here

// Instance method to check if OTP is valid
otpSchema.methods.isValid = function() {
  return !this.isUsed && this.attempts < 3 && this.expiresAt > new Date();
};

// Instance method to mark OTP as used
otpSchema.methods.markAsUsed = function() {
  this.isUsed = true;
  return this.save();
};

// Instance method to increment attempts
otpSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

// Static method to generate 6-digit OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Static method to find valid OTP
otpSchema.statics.findValidOTP = function(email, otp) {
  return this.findOne({
    email: email.toLowerCase(),
    otp: otp,
    isUsed: false,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 3 }
  });
};

module.exports = mongoose.model('OTP', otpSchema);


