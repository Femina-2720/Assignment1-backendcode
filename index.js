// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const itemsRoute = require('./routes/items');
const cartRoutes = require('./routes/cart');
const authRoute = require('./routes/auth');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/items', itemsRoute);
app.use('/cart', cartRoutes);
app.use('/auth', authRoute);

app.get('/', (req, res) => res.send('Backend running. Use /items, /cart, or /auth'));

// MongoDB connect
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
