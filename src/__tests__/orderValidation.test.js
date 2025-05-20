const mongoose = require('mongoose');
require('../models/Order');
const Order = mongoose.model('Order');

describe('Order Validation', () => {
    beforeAll(async () => {
        // Connect to a test database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    afterEach(async () => {
        await Order.deleteMany({});
    });

    test('gift-only orders should not require shipping address', async () => {
        const orderData = {
            orderNumber: 'TEST-001',
            items: [{
                product: { id: 'product1', name: 'Test Product 1' },
                quantity: 1,
                price: 10.00,
                isGift: true
            }],
            isGiftOnly: true,
            shippingAddress: {
                name: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '123456789'
                // Intentionally omitting address, city, postalCode, province
            },
            deliveryMethod: 'pickup',
            totalAmount: 10.00,
            subtotal: 10.00,
            tax: 2.10
        };

        const order = new Order(orderData);
        const validationError = order.validateSync();
        expect(validationError).toBeUndefined();
    });

    test('mixed orders (gift and regular items) should require shipping address', async () => {
        const orderData = {
            orderNumber: 'TEST-002',
            items: [
                {
                    product: { id: 'product1', name: 'Test Product 1' },
                    quantity: 1,
                    price: 10.00,
                    isGift: true
                },
                {
                    product: { id: 'product2', name: 'Test Product 2' },
                    quantity: 1,
                    price: 20.00,
                    isGift: false
                }
            ],
            isGiftOnly: false,
            shippingAddress: {
                name: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '123456789'
                // Intentionally omitting address, city, postalCode, province
            },
            deliveryMethod: 'delivery',
            totalAmount: 30.00,
            subtotal: 30.00,
            tax: 6.30
        };

        const order = new Order(orderData);
        const validationError = order.validateSync();
        expect(validationError).toBeDefined();
        expect(validationError.errors['shippingAddress.address']).toBeDefined();
        expect(validationError.errors['shippingAddress.city']).toBeDefined();
        expect(validationError.errors['shippingAddress.postalCode']).toBeDefined();
        expect(validationError.errors['shippingAddress.province']).toBeDefined();
    });

    test('regular orders should require shipping address', async () => {
        const orderData = {
            orderNumber: 'TEST-003',
            items: [{
                product: { id: 'product1', name: 'Test Product 1' },
                quantity: 1,
                price: 10.00,
                isGift: false
            }],
            isGiftOnly: false,
            shippingAddress: {
                name: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '123456789'
                // Intentionally omitting address, city, postalCode, province
            },
            deliveryMethod: 'delivery',
            totalAmount: 10.00,
            subtotal: 10.00,
            tax: 2.10
        };

        const order = new Order(orderData);
        const validationError = order.validateSync();
        expect(validationError).toBeDefined();
        expect(validationError.errors['shippingAddress.address']).toBeDefined();
        expect(validationError.errors['shippingAddress.city']).toBeDefined();
        expect(validationError.errors['shippingAddress.postalCode']).toBeDefined();
        expect(validationError.errors['shippingAddress.province']).toBeDefined();
    });
});
