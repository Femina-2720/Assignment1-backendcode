const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Item = require('./models/Item');

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  await Item.deleteMany();
  await Item.insertMany([
    { name: "T-Shirt", description: "Cotton T-Shirt", category: "Clothing", price: 500 },
    { name: "Laptop", description: "Gaming Laptop", category: "Electronics", price: 70000 },
    { name: "Shoes", description: "Running Shoes", category: "Footwear", price: 2000 },
    { name: "Watch", description:"Smart watches", category: "Electronics", price: 1000 }
  ]);

  console.log("Seeded data");
  process.exit();
}

seed();
