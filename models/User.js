const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function() {
      return !this.isFirebaseUser; // only required if not a Firebase user
    }
  },
  isFirebaseUser: {
    type: Boolean,
    default: false
  },
  firebaseUid: {
    type: String,
    default: null
  }
}, { timestamps: true });

userSchema.pre("validate", function(next) {
  if (this.isFirebaseUser) this.password = undefined; // skip password validation
  next();
});

module.exports = mongoose.model("User", userSchema);