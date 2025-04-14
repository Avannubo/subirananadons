const { MongoClient } = require('mongodb'); 
const bcrypt = require('bcryptjs');
async function seedDatabase() {
    const uri = 'mongodb+srv://arjunsingh:2LKnqF4ZpQVxZvvh@cluster0.zzuehnx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; // Update with your MongoDB connection string
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('test'); // Replace with your database name

        // 1. Clear existing collections
        const collections = await db.listCollections().toArray();
        for (const collection of collections) {
            await db.collection(collection.name).deleteMany({});
        }
        console.log('🔥 Database cleared');

        // 2. Seed Users (5 rows)
        const hashedPassword = await bcrypt.hash('password123', 10);
        const users = await db.collection('users').insertMany([
            {
                firstName: "Marc",
                lastName: "Marí",
                email: "marc.mari@avannubo.com",
                password: hashedPassword,
                birthDate: new Date(1991, 10, 26),
                receiveOffers: true,
                subscribedToNewsletter: true,
                privacyConsent: true,
                isAdmin: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                firstName: "Arjun",
                lastName: "Singh",
                email: "arjun.singh@avannubo.com",
                password: hashedPassword,
                birthDate: new Date(1990, 5, 15),
                receiveOffers: false,
                subscribedToNewsletter: true,
                privacyConsent: true,
                isAdmin: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                firstName: "Emma",
                lastName: "Johnson",
                email: "emma.johnson@example.com",
                password: hashedPassword,
                isAdmin: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                firstName: "Liam",
                lastName: "Smith",
                email: "liam.smith@example.com",
                password: hashedPassword,
                isAdmin: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                firstName: "Olivia",
                lastName: "Brown",
                email: "olivia.brown@example.com",
                password: hashedPassword,
                isAdmin: false,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
        console.log(`👥 Created ${users.insertedCount} users`);

        // Get user IDs for relationships
        const userDocs = await db.collection('users').find().toArray();

        // 3. Seed Products (5 rows)
        const products = await db.collection('products').insertMany([
            {
                name: "Baby Onesie",
                price: 12.99,
                description: "Soft cotton onesie for newborns",
                category: "clothing",
                stock: 50,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Wooden Rattle",
                price: 8.99,
                description: "Eco-friendly wooden baby rattle",
                category: "toys",
                stock: 30,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Nursing Pillow",
                price: 29.99,
                description: "Ergonomic nursing pillow",
                category: "feeding",
                stock: 20,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Baby Blanket",
                price: 24.99,
                description: "Soft organic cotton blanket",
                category: "bedding",
                stock: 40,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Diaper Bag",
                price: 35.99,
                description: "Spacious waterproof diaper bag",
                category: "accessories",
                stock: 25,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
        console.log(`📦 Created ${products.insertedCount} products`);

        // Get product IDs for relationships
        const productDocs = await db.collection('products').find().toArray();

        // 4. Seed Payment Methods (5 rows)
        const paymentMethods = await db.collection('paymentmethods').insertMany([
            {
                user: userDocs[0]._id,
                type: "credit_card",
                details: {
                    cardNumber: "************1111",
                    expiry: "12/25",
                    name: "Marc Marí"
                },
                isDefault: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                user: userDocs[1]._id,
                type: "paypal",
                details: {
                    email: "arjun.singh@avannubo.com"
                },
                isDefault: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                user: userDocs[2]._id,
                type: "credit_card",
                details: {
                    cardNumber: "************2222",
                    expiry: "06/24",
                    name: "Emma Johnson"
                },
                isDefault: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                user: userDocs[3]._id,
                type: "bank_transfer",
                details: {
                    accountNumber: "******7890",
                    bankName: "Example Bank"
                },
                isDefault: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                user: userDocs[4]._id,
                type: "credit_card",
                details: {
                    cardNumber: "************3333",
                    expiry: "09/26",
                    name: "Olivia Brown"
                },
                isDefault: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
        console.log(`💳 Created ${paymentMethods.insertedCount} payment methods`);

        // 5. Seed Addresses (5 rows)
        const addresses = await db.collection('addresses').insertMany([
            {
                user: userDocs[0]._id,
                type: "home",
                street: "123 Main St",
                city: "Barcelona",
                state: "Catalonia",
                postalCode: "08001",
                country: "Spain",
                isDefault: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                user: userDocs[1]._id,
                type: "work",
                street: "456 Tech Park",
                city: "Madrid",
                state: "Madrid",
                postalCode: "28001",
                country: "Spain",
                isDefault: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                user: userDocs[2]._id,
                type: "home",
                street: "789 Oak Ave",
                city: "Valencia",
                state: "Valencia",
                postalCode: "46001",
                country: "Spain",
                isDefault: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                user: userDocs[3]._id,
                type: "other",
                street: "321 Pine Rd",
                city: "Seville",
                state: "Andalusia",
                postalCode: "41001",
                country: "Spain",
                isDefault: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                user: userDocs[4]._id,
                type: "home",
                street: "654 Maple Ln",
                city: "Bilbao",
                state: "Basque Country",
                postalCode: "48001",
                country: "Spain",
                isDefault: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
        console.log(`🏠 Created ${addresses.insertedCount} addresses`);

        // 6. Seed Orders (5 rows)
        const orders = await db.collection('orders').insertMany([
            {
                user: userDocs[0]._id,
                orderNumber: `ORD-${Date.now()}`,
                items: [
                    {
                        product: productDocs[0]._id,
                        quantity: 2,
                        price: productDocs[0].price
                    },
                    {
                        product: productDocs[1]._id,
                        quantity: 1,
                        price: productDocs[1].price
                    }
                ],
                shippingAddress: addresses[0]._id,
                paymentMethod: paymentMethods[0]._id,
                status: "delivered",
                totalAmount: (productDocs[0].price * 2) + productDocs[1].price,
                trackingNumber: "TRK123456789",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            // ... 4 more orders
        ]);
        console.log(`📦 Created ${orders.insertedCount} orders`);

        // 7. Seed Birth Lists (5 rows)
        const birthLists = await db.collection('birthlists').insertMany([
            {
                user: userDocs[0]._id,
                title: "Baby Marí's Wishlist",
                description: "Our baby registry for the new arrival",
                dueDate: new Date(2023, 11, 15),
                items: [
                    {
                        product: productDocs[0]._id,
                        quantity: 5,
                        reserved: 2,
                        priority: 1
                    },
                    {
                        product: productDocs[2]._id,
                        quantity: 1,
                        reserved: 0,
                        priority: 2
                    }
                ],
                isPublic: true,
                theme: "neutral",
                shippingAddress: addresses[0]._id,
                contributors: [
                    {
                        user: userDocs[1]._id,
                        contributedAt: new Date()
                    }
                ],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            // ... 4 more birth lists
        ]);
        console.log(`🎁 Created ${birthLists.insertedCount} birth lists`);

        console.log('✅ Database seeded successfully!');
        console.log('🔑 Admin credentials: arjun.singh@avannubo.com / password123');
        console.log('👤 User credentials: marc.mari@avannubo.com / password123');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await client.close();
    }
}

seedDatabase();