const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
    },
    description: String,
    category: {
      type: String,
      enum: ['Productivity', 'Quality', 'Leadership', 'Learning & Development', 'Strategic Project'],
      default: 'Productivity',
    },
    targetDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
      default: 'In Progress',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    weightage: {
      type: Number,
      default: 20, // percentage weight
    },
    metricsKPI: {
      metricName: String,
      targetValue: String,
      currentValue: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Goal', goalSchema);
