const request = require('supertest');
const app = require('./server');

describe('Ecommerce Store APIs - Edge Cases', () => {
  it('should return error if missing fields in cart', async () => {
    const res = await request(app).post('/cart').send({
      userId: 'user1',
      quantity: 2
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Invalid input. Provide a valid userId, itemId, and quantity > 0.');
  });

  it('should return error for empty cart at checkout', async () => {
    const res = await request(app).post('/checkout').send({
      userId: 'user1'
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Cart is empty. Please add items before checking out.');
  });

  it('should return error for invalid discount code', async () => {
    const res = await request(app).post('/checkout').send({
      userId: 'user1',
      discountCode: 'INVALIDCODE'
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Invalid or expired discount code.');
  });

  it('should apply discount and return total after successful checkout', async () => {
    // Add items to cart first
    await request(app).post('/cart').send({
      userId: 'user1',
      itemId: 'item1',
      quantity: 2
    });

    // Checkout without discount code
    const res = await request(app).post('/checkout').send({
      userId: 'user1',
      discountCode: ''
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.totalAmount).toBe(200); // 2 items, $100 each
  });

  it('should generate discount code on nth order', async () => {
    for (let i = 0; i < 4; i++) {
      await request(app).post('/cart').send({
        userId: `user${i}`,
        itemId: `item${i}`,
        quantity: 1
      });
      await request(app).post('/checkout').send({ userId: `user${i}` });
    }

    const res = await request(app).post('/checkout').send({
      userId: 'user4',
      discountCode: ''
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.discountCode).toBeDefined(); // Discount code generated after 5th order
  });

  it('should return admin stats', async () => {
    const res = await request(app).get('/admin/stats');
    expect(res.statusCode).toEqual(200);
    expect(res.body.totalItemsPurchased).toBeGreaterThan(0);
  });
});
