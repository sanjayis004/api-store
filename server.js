const express = require('express');
const app = express();
app.use(express.json());

const carts = {}; // Store carts as userId -> { items: {...}, total: number }
const orders = [];
const discountCodes = {};
const nthOrder = 5;
let orderCount = 0;

// Helper function to initialize cart if needed
const getOrCreateCart = (userId) => {
  if (!carts[userId]) {
    carts[userId] = { items: {}, total: 0 }; // Items stored as itemId -> { quantity, totalPrice }
  }
  return carts[userId];
};

// Add Item to Cart API
app.post('/cart', (req, res) => {
  const { userId, itemId, quantity } = req.body;

  if (!userId || !itemId || typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid input. Provide a valid userId, itemId, and quantity > 0.' });
  }

  const cart = getOrCreateCart(userId);

  // If the item already exists in the cart, update quantity
  if (cart.items[itemId]) {
    cart.items[itemId].quantity += quantity;
    cart.items[itemId].totalPrice += quantity * 100; // Assume $100 per item
  } else {
    cart.items[itemId] = { quantity, totalPrice: quantity * 100 };
  }

  // Maintain running total
  cart.total += quantity * 100;

  return res.status(200).json({ message: 'Item added to cart successfully.' });
});

// Checkout API with Discount Validation
app.post('/checkout', (req, res) => {
  const { userId, discountCode } = req.body;

  if (!userId || !carts[userId] || Object.keys(carts[userId].items).length === 0) {
    return res.status(400).json({ error: 'User does not exist or cart is empty.' });
  }

  let cart = carts[userId];
  let finalAmount = cart.total;

  // Validate discount code (using cache or lookup)
  if (discountCode) {
    const discount = discountCodes[discountCode];
    if (!discount || !discount.isValid) {
      return res.status(400).json({ error: 'Invalid or expired discount code.' });
    }

    // Apply discount if valid
    finalAmount *= 0.9; // 10% discount
    discount.isValid = false; // Mark discount code as used
  }

  // Finalize the order
  orderCount += 1;
  orders.push({ userId, items: cart.items, totalAmount: finalAmount });

  // Edge Case: Generate discount code if nth order
  let generatedCode = null;
  if (orderCount % nthOrder === 0) {
    generatedCode = `DISCOUNT${orderCount}`;
    discountCodes[generatedCode] = { isValid: true };
  }

  // Clear cart
  delete carts[userId];

  return res.status(200).json({
    message: 'Order placed successfully.',
    totalAmount: finalAmount,
    ...(generatedCode && { discountCode: generatedCode })
  });
});

// Admin API to Generate Discount Code
app.post('/admin/discount-code', (req, res) => {
  const discountCode = `DISCOUNT${orderCount}`;
  discountCodes[discountCode] = { isValid: true };
  return res.status(200).json({ discountCode });
});

// Admin API for Purchase Statistics with Pagination
app.get('/admin/stats', (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Support pagination

  const start = (page - 1) * limit;
  const end = page * limit;
  const paginatedOrders = orders.slice(start, end);

  let totalItemsPurchased = 0;
  let totalPurchaseAmount = 0;

  paginatedOrders.forEach(order => {
    Object.values(order.items).forEach(item => {
      totalItemsPurchased += item.quantity;
    });
    totalPurchaseAmount += order.totalAmount;
  });

  const discountList = Object.keys(discountCodes).map(code => ({
    code,
    isValid: discountCodes[code].isValid
  }));

  return res.status(200).json({
    totalItemsPurchased,
    totalPurchaseAmount,
    discountCodes: discountList,
    currentPage: page,
    totalPages: Math.ceil(orders.length / limit)
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing
