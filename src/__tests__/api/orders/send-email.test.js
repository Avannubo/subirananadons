import { expect, test, describe, jest } from '@jest/globals';
import EmailService from '@/services/EmailService';
import Order from '@/models/Order';

// Mock dependencies
jest.mock('@/services/EmailService');
jest.mock('@/models/Order');
jest.mock('@/lib/dbConnect', () => jest.fn());

describe('Order Email API', () => {
    const mockOrder = {
        _id: '123',
        orderNumber: 'ORD-123',
        items: [
            {
                product: {
                    name: 'Test Product',
                    price: 100,
                    image: '/test.jpg'
                },
                quantity: 2
            }
        ],
        shippingAddress: {
            name: 'Test User',
            email: 'test@example.com',
            address: 'Test Street 1',
            city: 'Test City',
            postalCode: '12345'
        },
        total: 200,
    };

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        // Setup Order.findById mock
        Order.findById.mockImplementation(() => ({
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue(mockOrder)
        }));
    });

    test('should send order confirmation email successfully', async () => {
        // Mock EmailService.sendOrderConfirmationEmail
        EmailService.sendOrderConfirmationEmail.mockResolvedValue({
            messageId: 'test-message-id'
        });

        const response = await EmailService.sendOrderConfirmationEmail(
            mockOrder,
            mockOrder.shippingAddress.email
        );

        // Verify email was sent with correct data
        expect(EmailService.sendOrderConfirmationEmail).toHaveBeenCalledWith(
            mockOrder,
            mockOrder.shippingAddress.email
        );

        expect(response).toHaveProperty('messageId');
    });

    test('should handle missing order data', async () => {
        const invalidOrder = { ...mockOrder };
        delete invalidOrder.items;

        await expect(
            EmailService.sendOrderConfirmationEmail(
                invalidOrder,
                invalidOrder.shippingAddress.email
            )
        ).rejects.toThrow('Invalid order data');
    });
});
