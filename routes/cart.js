const express = require("express");
const Cart = require("../models/Cart");
const Item = require("../models/Item");
const auth = require("../utils/authMiddleware");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

/**
 * @route   POST /cart/add
 * @desc    Add item to cart
 * @access  Private
 */
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    console.log("🟢 Incoming add-to-cart request:", req.body);

    const userId = req.user?.id;
    console.log("🟢 Current user:", userId);

    if (!userId) {
      return res.status(400).json({ error: "User not authenticated" });
    }

    if (!itemId) {
      return res.status(400).json({ error: "itemId is required" });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existing = cart.items.find(i => i.itemId.toString() === itemId);
    if (existing) {
      existing.quantity += quantity || 1;
    } else {
      cart.items.push({ itemId, quantity: quantity || 1 });
    }

    await cart.save();
    res.json({ message: "Item added to cart", cart });
  } catch (err) {
    console.error("❌ Add to cart error:", err);
    res.status(500).json({ error: err.message });
  }
});


/**
 * @route   GET /cart
 * @desc    Get user cart
 * @access  Private
 */
// Get user cart
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.itemId");
    if (!cart) {
      return res.json({ items: [] });
    }

    res.json({
      user: cart.user,
      items: cart.items.map(i => ({
        id: i.itemId._id,
        name: i.itemId.name,
        description: i.itemId.description,
        price: i.itemId.price,
        quantity: i.quantity,
        total: i.itemId.price * i.quantity
      }))
    });
  } catch (err) {
    console.error("❌ Cart fetch error:", err);
    res.status(500).json({ error: "server error" });
  }
});


/**
 * @route   DELETE /cart/remove/:itemId
 * @desc    Remove a specific item from cart
 * @access  Private
 */
// Remove item from cart
// DELETE /cart/remove/:itemId
// DELETE /cart/remove/:itemId
router.delete("/remove/:itemId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Correct field name
    cart.items = cart.items.filter(
      (i) => i.itemId.toString() !== itemId
    );

    await cart.save();
    res.json({ message: "Item removed", items: cart.items });
  } catch (err) {
    console.error("❌ Remove cart error:", err);
    res.status(500).json({ message: "Failed to remove item" });
  }
});


// PATCH /cart/update/:itemId
/**
 * @route   PATCH /cart/update/:itemId
 * @desc    Update quantity of a specific item in cart
 * @access  Private
 */
router.patch("/update/:itemId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((i) => i.itemId.toString() === itemId);
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    // Update the quantity
    item.quantity = quantity;

    await cart.save();

    // Populate item info to send back to frontend
    const populatedCart = await Cart.findOne({ user: userId }).populate(
      "items.itemId"
    );

    res.json({
      message: "Quantity updated",
      items: populatedCart.items.map((i) => ({
        id: i.itemId._id,
        name: i.itemId.name,
        description: i.itemId.description,
        price: i.itemId.price,
        quantity: i.quantity,
        total: i.itemId.price * i.quantity,
      })),
    });
  } catch (err) {
    console.error("❌ Update quantity error:", err);
    res.status(500).json({ message: "Failed to update quantity" });
  }
});



module.exports = router;
