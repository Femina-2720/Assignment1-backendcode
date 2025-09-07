const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  image: String
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
