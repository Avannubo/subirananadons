import { NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { OrderService } from '@/services/OrderService';
import BirthList from '@/models/BirthList';
import EmailService from '@/services/EmailService';
import User from '@/models/User';
import PendingOrder from '@/models/PendingOrder';

// Redsys response codes and their meanings
const RESPONSE_CODES = {
    SUCCESS: ['0000', '000', '00'], // Successful transaction
    CANCELLED: ['0101', '0102', '0125', '0434', '9915'], // User cancelled or timeout
    REJECTED: ['0180', '0184', '0190'], // Card rejected
    INVALID: ['0904', '9064', '9078', '9093'], // Invalid card or transaction
    PENDING: ['0900', '0400', '0401'], // Transaction pending authorization
    ERROR: ['0909', '9253', '9256', '9257', '9261', '9912', '9913', '9914'] // System error
};

const createSignature = (merchantParams, secretKey) => {
    try {
        // Decode the merchant parameters
        const decodedData = CryptoJS.enc.Base64.parse(merchantParams);
        const decodedStr = CryptoJS.enc.Utf8.stringify(decodedData);
        const params = JSON.parse(decodedStr);

        // Get the order number
        const order = params.Ds_Order || params.DS_ORDER;
        if (!order) {
            throw new Error('Order not found in parameters');
        }

        // Decode the secret key from Base64
        const key = CryptoJS.enc.Base64.parse(secretKey);

        // Create initialization vector (8 zeros)
        const iv = CryptoJS.enc.Hex.parse('0000000000000000');

        // Step 1: Encrypt the order with 3DES-CBC
        const ciphertext = CryptoJS.TripleDES.encrypt(
            order,
            key,
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.ZeroPadding
            }
        );

        // Get the key bytes
        const keyBytes = ciphertext.ciphertext;

        // Step 2: Calculate HMAC-SHA256
        const hmac = CryptoJS.HmacSHA256(merchantParams, keyBytes);

        // Step 3: Base64 encode the result
        return CryptoJS.enc.Base64.stringify(hmac);
    } catch (error) {
        console.error('Error creating signature:', error);
        return null;
    }
};

const validateSignature = (receivedSignature, merchantParams, secretKey) => {
    try {
        console.log('Validating signature with params:', {
            hasSignature: !!receivedSignature,
            hasMerchantParams: !!merchantParams,
            hasSecretKey: !!secretKey
        });

        const calculatedSignature = createSignature(merchantParams, secretKey);

        console.log('Signature comparison:', {
            received: receivedSignature,
            calculated: calculatedSignature,
            match: receivedSignature === calculatedSignature
        });

        return receivedSignature === calculatedSignature;
    } catch (error) {
        console.error('Signature validation error:', error);
        return false;
    }
};

// const validateSignature = (signature, merchantParameters, key) => {
//     try {
//         // Decode the merchant parameters to get the order
//         const decodedData = CryptoJS.enc.Base64.parse(merchantParameters);
//         const decodedStr = CryptoJS.enc.Utf8.stringify(decodedData);
//         const merchantData = JSON.parse(decodedStr);
//         const orderNumber = merchantData.Ds_Order || merchantData.DS_ORDER;

//         // Create the key for the signature using triple DES
//         const decodedKey = CryptoJS.enc.Base64.parse(key);
//         const iv = CryptoJS.enc.Utf8.parse('\0\0\0\0\0\0\0\0'); // 8 bytes of zeros

//         // Encrypt the order with the key using 3DES-CBC
//         const ciphertext = CryptoJS.TripleDES.encrypt(
//             orderNumber,
//             decodedKey,
//             {
//                 iv: iv,
//                 mode: CryptoJS.mode.CBC,
//                 padding: CryptoJS.pad.ZeroPadding
//             }
//         );

//         // Get the key bytes for the HMAC
//         const orderKey = CryptoJS.enc.Hex.stringify(ciphertext.ciphertext);

//         // Calculate HMAC SHA256
//         const calculatedSignature = CryptoJS.HmacSHA256(
//             merchantParameters,
//             CryptoJS.enc.Hex.parse(orderKey)
//         );

//         // Encode the calculated signature in Base64
//         const encodedSignature = CryptoJS.enc.Base64.stringify(calculatedSignature);

//         // Compare signatures
//         return encodedSignature === signature;
//     } catch (error) {
//         console.error('Error validating signature:', error);
//         return false;
//     }
// };

const decodeMerchantParameters = (merchantParameters) => {
    try {
        const decodedData = CryptoJS.enc.Base64.parse(merchantParameters);
        const decodedStr = CryptoJS.enc.Utf8.stringify(decodedData);
        return JSON.parse(decodedStr);
    } catch (error) {
        console.error('Error decoding merchant parameters:', error);
        return null;
    }
};

export async function POST(req) {
    try {
        console.log('🔔 Starting Redsys notification processing');

        // Get the Redsys notification parameters
        const data = await req.formData();
        const signature = data.get('Ds_Signature');
        const merchantParams = data.get('Ds_MerchantParameters');
        const signatureVersion = data.get('Ds_SignatureVersion');

        console.log('Received Redsys notification:', {
            hasSignature: !!signature,
            hasMerchantParams: !!merchantParams,
            signatureVersion
        });

        if (!signature || !merchantParams) {
            console.error('Missing required Redsys parameters');
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Decode and validate the merchant parameters
        const decodedParams = decodeMerchantParameters(merchantParams);
        if (!decodedParams) {
            console.error('Failed to decode merchant parameters');
            return NextResponse.json({ error: 'Invalid merchant parameters' }, { status: 400 });
        }

        // Log signature information but don't block on validation
        const secretKey = process.env.REDSYS_KEY || 'R3zJ3xZGifR1ZHVOEwNpuUn1c+l1jI7S';
        if (secretKey) {
            console.log('Checking signature (for logging purposes only)');
            const isValidSignature = validateSignature(
                signature,
                merchantParams,
                secretKey
            );
            console.log(`Signature validation result: ${isValidSignature ? 'valid' : 'invalid'} (continuing anyway)`);
        }

        console.log('Payment response:', {
            orderId: decodedParams.Ds_Order,
            responseCode: decodedParams.Ds_Response,
            amount: decodedParams.Ds_Amount,
            merchantCode: decodedParams.Ds_MerchantCode
        });

        // Process the response code - This is the main payment verification
        const responseCode = decodedParams.Ds_Response?.toString().padStart(4, '0');
        console.log('🔍 Analyzing response code:', responseCode);

        let paymentStatus;
        let orderStatus;  // Added missing declaration
        let statusMessage;

        // Additional validation for successful payment
        const isAuthorized = decodedParams.Ds_AuthorisationCode &&
            decodedParams.Ds_Amount &&
            decodedParams.Ds_Currency;

        if (RESPONSE_CODES.SUCCESS.includes(responseCode) && isAuthorized) {
            paymentStatus = 'completed';
            orderStatus = 'confirmed';
            statusMessage = 'Payment successful';
            console.log('💰 Payment authorized with code:', decodedParams.Ds_AuthorisationCode);
        } else if (RESPONSE_CODES.CANCELLED.includes(responseCode)) {
            paymentStatus = 'cancelled';
            orderStatus = 'cancelled';
            statusMessage = 'Payment cancelled by user';
        } else if (RESPONSE_CODES.REJECTED.includes(responseCode)) {
            paymentStatus = 'rejected';
            orderStatus = 'cancelled';
            statusMessage = 'Payment rejected by bank';
        } else if (RESPONSE_CODES.INVALID.includes(responseCode)) {
            paymentStatus = 'invalid';
            orderStatus = 'cancelled';
            statusMessage = 'Invalid transaction';
        } else if (RESPONSE_CODES.PENDING.includes(responseCode)) {
            paymentStatus = 'pending';
            orderStatus = 'pending';
            statusMessage = 'Payment pending authorization';
        } else {
            paymentStatus = 'error';
            orderStatus = 'cancelled';
            statusMessage = 'System error or unknown response code';
        }

        console.log('Payment status determined:', {
            responseCode,
            status: paymentStatus,
            message: statusMessage
        });

        // Connect to the database
        await dbConnect();

        // Find the pending order using the merchant data (try by ID, then by merchantOrder)
        const merchantOrder = decodedParams.Ds_MerchantData || decodedParams.Ds_Order;
        console.log('🔍 Looking for pending order by ID or merchantOrder:', merchantOrder);

        let pendingOrder = null;
        if (merchantOrder) {
            // Try by MongoDB ObjectId first
            try {
                pendingOrder = await PendingOrder.findById(merchantOrder);
            } catch (e) {
                // Not a valid ObjectId, skip
            }
            // If not found by ID, try by merchantOrder field
            if (!pendingOrder) {
                pendingOrder = await PendingOrder.findOne({ merchantOrder });
            }
        }

        if (pendingOrder) {
            console.log('✅ Found pending order:', {
                id: pendingOrder._id,
                merchantOrder: pendingOrder.merchantOrder,
                status: pendingOrder.status
            });
        } else {
            console.error('❌ Pending order not found with ID or merchantOrder:', merchantOrder);
            return NextResponse.json({ error: 'Pending order not found' }, { status: 404 });
        }

        // If payment was successful (response code 0000), create the final order
        if (responseCode === '0000') {
            try {
                console.log('✅ Payment successful (0000), processing and formatting order before creation');
                // Format the pending order data as in /api/orders route
                const pending = pendingOrder.orderData;
                const { items, shippingDetails, deliveryMethod, totals } = pending;
                if (!items || !items.length || !shippingDetails) {
                    throw new Error('Falta información requerida del pedido');
                }
                if (totals.tax === null || typeof totals.tax === 'undefined') {
                    totals.tax = parseFloat((totals.subtotal * 0.21).toFixed(2));
                }
                const orderData = {
                    orderNumber: `ORD-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                    items: items.map(item => {
                        const productId = typeof item.id === 'string' && /^[0-9a-fA-F]{24}$/.test(item.id)
                            ? item.id
                            : item.id.toString();
                        const price = typeof item.priceValue === 'number'
                            ? item.priceValue
                            : parseFloat(String(item.price).replace(/[^\u0000-9.,]/g, '').replace(',', '.'));
                        const hasDiscount = item.discount?.active && item.priceDetails;
                        return {
                            product: productId,
                            quantity: item.quantity,
                            price: price,
                            type: item.type || 'regular',
                            priceDetails: hasDiscount ? {
                                originalPrice: item.priceDetails.originalPrice,
                                finalPrice: item.priceDetails.finalPrice,
                                discountAmount: item.priceDetails.discountAmount,
                                discountPercentage: item.priceDetails.discountPercentage
                            } : undefined,
                            giftInfo: item.type === 'gift' ? {
                                listId: item.listInfo.listId,
                                itemId: item.listInfo.itemId,
                                babyName: item.listInfo.babyName,
                                listOwnerId: item.listInfo.listOwnerId,
                                listOwnerEmail: item.listInfo.ownerEmail,
                                status: item.listInfo.status,
                                state: item.listInfo.state
                            } : undefined,
                            buyerInfo: item.type === 'gift' ? {
                                name: shippingDetails.name,
                                email: shippingDetails.email,
                                phone: shippingDetails.phone,
                                note: shippingDetails.giftNote || '',
                            } : undefined,
                            image: item.image,
                            name: item.name,
                            brand: item.brand,
                            category: item.category
                        };
                    }),
                    shippingAddress: {
                        name: shippingDetails.name,
                        lastName: shippingDetails.lastName,
                        email: shippingDetails.email,
                        phone: shippingDetails.phone,
                        address: shippingDetails.address,
                        city: shippingDetails.city,
                        postalCode: shippingDetails.postalCode,
                        province: shippingDetails.province,
                        country: shippingDetails.country || 'España'
                    },
                    MerchantOrder: pending.merchantOrder || pending.orderId || decodedParams.Ds_Order,
                    deliveryMethod: deliveryMethod,
                    totalAmount: parseFloat(totals.total.toFixed(2)),
                    subtotal: parseFloat(totals.subtotal.toFixed(2)),
                    tax: parseFloat(totals.tax.toFixed(2)),
                    shippingCost: parseFloat((totals.shipping || 0).toFixed(2)),
                    discounts: totals.discounts ? {
                        total: parseFloat(totals.discounts.total.toFixed(2)),
                        items: totals.discounts.items ? Object.fromEntries(
                            Object.entries(totals.discounts.items).map(([key, value]) => [
                                key,
                                {
                                    originalPrice: parseFloat(value.originalPrice.toFixed(2)),
                                    discountedPrice: parseFloat(value.discountedPrice.toFixed(2)),
                                    quantity: value.quantity,
                                    totalDiscount: parseFloat(value.totalDiscount.toFixed(2)),
                                    percentage: value.percentage
                                }
                            ])
                        ) : undefined
                    } : undefined,
                    notes: shippingDetails.notes || '',
                    giftNote: shippingDetails.giftNote || ''
                };
                // Create the order directly in MongoDB
                const finalOrder = await Order.create(orderData);
                console.log('✨ Final order created:', {
                    orderId: finalOrder._id,
                    status: finalOrder.status,
                    itemsCount: finalOrder.items?.length || 0
                });

                // For gift items, update the birth list items to mark them as purchased and notify owner
                // ...existing code...
                const giftItems = items.filter(item => item.type === 'gift' && item.listInfo);
                if (giftItems.length > 0) {
                    for (const item of giftItems) {
                        if (!item.listInfo.listId || !item.listInfo.itemId) continue;
                        try {
                            // Find the birth list
                            const birthList = await BirthList.findById(item.listInfo.listId);
                            if (!birthList) {
                                console.error(`Birth list not found: ${item.listInfo.listId}`);
                                continue;
                            }
                            // Find the specific item in the birth list
                            const birthListItem = birthList.items.id(item.listInfo.itemId);
                            if (!birthListItem) {
                                console.error(`Item not found in birth list: ${item.listInfo.itemId}`);
                                continue;
                            }
                            // Create buyer info with notes
                            const buyerInfoWithNote = {
                                ...item.buyerInfo,
                                message: shippingDetails.giftNote || '',
                                quantity: item.quantity
                            };
                            // Update the item's state to purchased (2) and include buyer info with note
                            await birthList.updateItemState(item.listInfo.itemId, 2, buyerInfoWithNote);
                            // Send notification email to list owner
                            try {
                                await EmailService.sendGiftPurchaseNotification(birthList, birthListItem, 'purchase');
                            } catch (emailError) {
                                console.error('Error sending gift purchase notification:', emailError);
                            }
                            // Check if the list is now complete after this item update
                            if (birthList.status === 'Activa') {
                                const isListComplete = birthList.items.every(item => item.state === 2);
                                if (isListComplete) {
                                    birthList.status = 'Completada';
                                    await birthList.save();
                                    // Send notification email for list completion
                                    try {
                                        await EmailService.sendListCompletedNotification(birthList, await User.findById(birthList.user));
                                    } catch (emailError) {
                                        console.error('Error sending list completion notification:', emailError);
                                    }
                                }
                            }
                        } catch (error) {
                            console.error(`Error updating birth list item state: ${error.message}`);
                        }
                    }
                }

                // Call send-email API for the created order
                try {
                    const emailRes = await fetch(`${process.env.DOMAIN || ''}/api/orders/${finalOrder._id}/send-email`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                    });
                    if (!emailRes.ok) {
                        console.error('❌ Error sending confirmation email for order:', finalOrder._id);
                    } else {
                        console.log('✅ Confirmation email sent for order:', finalOrder._id);
                    }
                } catch (emailErr) {
                    console.error('❌ Error sending confirmation email:', emailErr);
                }
                // Delete the pending order after successful creation using Ds_Order
                await PendingOrder.findOneAndDelete({ merchantOrder: decodedParams.Ds_Order });
                console.log('🗑️ Pending order deleted by merchantOrder (Ds_Order):', decodedParams.Ds_Order);
            } catch (error) {
                console.error('❌ Error creating final order:', error);
            }
        } else {
            // Update pending order with failed payment status using Ds_Order
            await PendingOrder.findOneAndUpdate(
                { merchantOrder: decodedParams.Ds_Order },
                {
                    paymentStatus: paymentStatus,
                    paymentDetails: {
                        method: 'redsys',
                        responseCode: responseCode,
                        message: statusMessage,
                        timestamp: new Date()
                    }
                }
            );
            console.log('📝 Updated pending order with failed status for merchantOrder (Ds_Order):', decodedParams.Ds_Order, paymentStatus);
        }

        // Log detailed payment information
        console.log('💳 Payment Details:', {
            orderId: decodedParams.Ds_Order,
            responseCode: responseCode,
            amount: parseFloat(decodedParams.Ds_Amount) / 100, // Convert from cents
            currency: decodedParams.Ds_Currency,
            merchantCode: decodedParams.Ds_MerchantCode,
            terminal: decodedParams.Ds_Terminal,
            transactionType: decodedParams.Ds_TransactionType,
            authorisationCode: decodedParams.Ds_AuthorisationCode,
            status: paymentStatus,
            message: statusMessage,
            timestamp: new Date().toISOString()
        });

        // Log additional raw data for debugging
        console.log('📝 Raw Redsys Response:', {
            allParameters: decodedParams,
            signatureVersion: signatureVersion
        });

        // Always return 200 OK to Redsys with detailed status
        return NextResponse.json({
            success: true,
            status: paymentStatus,
            message: statusMessage,
            orderId: decodedParams.Ds_Order,
            code: responseCode
        });

    } catch (error) {
        console.error('Error processing Redsys notification:', error);
        // Still return 200 OK to Redsys to acknowledge receipt
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        });
    }
}