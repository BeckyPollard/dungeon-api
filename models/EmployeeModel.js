const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'First name required'],
    trim: true
  },
  last_name: {
    type: String,
    required: [true, 'Last name required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email required'],
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter valid email address']
    // https://stackoverflow.com/questions/50330109/simple-regex-pattern-for-email
  },
  position: {
    type: String,
    required: [true, 'Position required'],
    trim: true
  },
  salary: {
    type: Number,
    required: [true, 'Salary required'],
    min: [0, `Salary can't be a negative number`]
  },
  date_of_joining: {
    type: Date,
    default: Date.now
  },
  department: {
    type: String,
    required: [true, 'Department required'],
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee must have owner ref']
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

EmployeeSchema.pre('save', async function(next) {
  this.updated_at = Date.now();
});

module.exports = mongoose.model('Employee', EmployeeSchema);
