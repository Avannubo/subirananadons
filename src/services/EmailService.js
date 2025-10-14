import nodemailer from 'nodemailer';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
const transporter = nodemailer.createTransport({
    service: 'outlook',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || "info@subirananadons.com",
        pass: process.env.EMAIL_PASS || "Ton38060"
    }
});
class EmailService {
    static async sendOrderConfirmation(order) {
        try {
            //console.log('Sending order confirmation email:', JSON.stringify(order));
            const items_list = order.items.map(item => {
                const hasDiscount = item.priceDetails?.discountAmount > 0;
                const finalPrice = hasDiscount ? item.priceDetails.finalPrice : item.price;
                return `<tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; max-width: 400px;">
                        <div style="display: flex; align-items: center;">
                            <img src="${item.product.images?.[0] || ''}" alt="${item.product.name}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 10px; flex-shrink: 0;"/>
                            <div style="min-width: 0; flex: 1;">
                                <div style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.product.name}">${item.product.name}</div>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
                        <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; background-color: ${item.type === 'gift' ? '#FFE4E1' : '#E8F5E9'}; color: ${item.type === 'gift' ? '#FF69B4' : '#2E7D32'}">${item.type === 'gift' ? 'Regalo' : 'Personal'}</span>
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                        ${hasDiscount ? `
                            <div style="text-decoration: line-through; color: #999;">${item.priceDetails.originalPrice.toFixed(2)}€</div>
                            <div style="font-weight: 600; color: #e41e31;">
                                ${item.priceDetails.finalPrice.toFixed(2)}€
                                <span style="font-size: 0.8em;">-${item.priceDetails.discountPercentage}%</span>
                            </div>
                        ` : `
                            <div>${item.price.toFixed(2)}€</div>
                        `}
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${(item.quantity * finalPrice).toFixed(2)}€</td>
                </tr>`}
            ).join('');
            const mailOptions = {
                from: "info@subirananadons.com",
                to: order.shippingAddress.email,
                cc: "info@subirananadons.com",
                subject: `Confirmación de pedido #${order.orderNumber} - Subirana Nadons`,
                html: `
                    <h1>¡Gracias por tu pedido!</h1>
                    <p>Hola ${order.shippingAddress.name},</p>
                    <p>Tu pedido ha sido confirmado con éxito.</p>
                    <h2>Detalles del pedido:</h2>
                    <p><strong>Número de pedido:</strong> ${order.orderNumber}</p>
                    <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString('es-ES')}</p>
                    <p><strong>Método de entrega:</strong> ${order.deliveryMethod === 'delivery' ? 'Envío a domicilio' : 'Recogida en tienda'}</p>
                    <table style="width:100%; border-collapse: collapse; margin: 20px 0; table-layout: fixed;">
                        <colgroup>
                            <col style="width: 400px;">
                            <col style="width: 100px;">
                            <col style="width: 100px;">
                            <col style="width: 150px;">
                            <col style="width: 150px;">
                        </colgroup>
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="padding: 10px; text-align: left; overflow: hidden; text-overflow: ellipsis;">Producto</th>
                                <th style="padding: 10px; text-align: center;">Tipo</th>
                                <th style="padding: 10px; text-align: center;">Cantidad</th>
                                <th style="padding: 10px; text-align: right;">Precio por unidad</th>
                                <th style="padding: 10px; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items_list}
                        </tbody>                        
                        <tfoot>
                            <tr style="background-color: #f8f9fa;">
                                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
                                <td colspan="2" style="padding: 10px; text-align: right;">${order.subtotal.toFixed(2)}€</td>
                            </tr>
                            ${order.discounts?.total > 0 ? `
                            <tr style="background-color: #f8f9fa;">
                                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total descuentos:</strong></td>
                                <td colspan="2" style="padding: 10px; text-align: right; color: #e41e31;">-${order.discounts.total.toFixed(2)}€</td>
                            </tr>
                            ` : ''}
                            <tr style="background-color: #f8f9fa;">
                                <td colspan="3" style="padding: 10px; text-align: right;"><strong>IVA (21%):</strong></td>
                                <td colspan="2" style="padding: 10px; text-align: right;">${order.tax.toFixed(2)}€</td>
                            </tr>
                            <tr style="background-color: #f8f9fa;">
                                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Gastos de envío:</strong></td>
                                <td colspan="2" style="padding: 10px; text-align: right;">${order.shippingCost.toFixed(2)}€</td>
                            </tr>
                            <tr style="background-color: #f8f9fa;">
                                <td colspan="5" style="border-top: 2px solid #dee2e6;"></td>
                            </tr>
                            <tr style="background-color: #f8f9fa; font-weight: bold;">
                                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
                                <td colspan="2" style="padding: 10px; text-align: right; font-size: 1.2em;">${order.totalAmount.toFixed(2)}€</td>
                            </tr>
                        </tfoot>
                    </table>
                    ${order.deliveryMethod === 'delivery' ? `
                        <h2>Dirección de envío:</h2>
                        <p>${order.shippingAddress.address}<br>
                        ${order.shippingAddress.postalCode} ${order.shippingAddress.city}<br>
                        ${order.shippingAddress.province}</p>
                    ` : `
                        <h2>Recogida en tienda:</h2>
                        <p>Te notificaremos cuando tu pedido esté listo para recoger.</p>
                    `}
                    <p>Gracias por confiar en Subirana Nadons.</p>
                `
            };
            await transporter.sendMail(mailOptions);
            // After sending the customer confirmation, notify list owners about purchased/reserved gifts
            try {
                const hasGifts = Array.isArray(order.items) && order.items.some(it => it && (it.type === 'gift' || (it.listInfo && (it.listInfo.listId || it.listInfo.listOwnerId))));
                if (hasGifts) {
                    await EmailService.sendOrderConfirmationToListOwners(order);
                }
            } catch (err) {
                console.error('Error notifying list owners for order:', err);
            }
        } catch (error) {
            console.error('Error sending order confirmation email:', error);
            throw error;
        }
    }
    /**
     * Notify list owners when an order contains gift items for their lists.
     * Groups items by list owner id and sends a single email per owner with the items relevant to them.
     * @param {Object} order
     */
    static async sendOrderConfirmationToListOwners(order) {
        try {
            if (!order || !Array.isArray(order.items)) return;
            await dbConnect();
            // Group gift items by listOwnerId
            const ownerMap = new Map();
            for (const item of order.items) {
                if (!item || item.type !== 'gift') continue;
                const listInfo = item.listInfo || {};
                const ownerId = listInfo.listOwnerId || listInfo.userId || listInfo.ownerId || null;
                if (!ownerId) continue;
                if (!ownerMap.has(ownerId)) ownerMap.set(ownerId, []);
                ownerMap.get(ownerId).push({ item, listInfo });
            }
            // For each owner, fetch email and send a summary
            for (const [ownerId, entries] of ownerMap.entries()) {
                try {
                    const owner = await User.findById(ownerId).select('email name').lean();
                    const ownerEmail = owner?.email || null;
                    const ownerName = owner?.name || '';
                    if (!ownerEmail) {
                        console.warn(`Skipping list owner notification: no email for ownerId ${ownerId}`);
                        continue;
                    }
                    // Build HTML table of items
                    const rows = entries.map(({ item, listInfo }) => {
                        const prod = item.product || {};
                        const prodName = prod?.name?.es || prod?.name?.ca || prod?.name || item.name || 'Producto';
                        const qty = item.quantity || 1;
                        const unitPrice = (item.priceDetails?.finalPrice ?? item.price ?? item.priceValue) || 0;
                        const total = (unitPrice * qty) || 0;
                        return `
                            <tr>
                                <td style="padding:8px;border-bottom:1px solid #eee">${prodName}</td>
                                <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${qty}</td>
                                <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${unitPrice.toFixed(2)}€</td>
                                <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${total.toFixed(2)}€</td>
                            </tr>`;
                    }).join('');
                    const mailHtml = `
                        <div style="font-family:Arial, sans-serif; background:#f8f9fa; padding:20px;">
                            <h2 style="color:#36A9E1;">Tu lista ha recibido una compra</h2>
                            <p>Hola ${ownerName || 'Propietario'},</p>
                            <p>Se ha realizado un pedido en la tienda que incluye artículos reservados/comprados de tu lista.</p>
                            <p><strong>Número de pedido:</strong> ${order.orderNumber}</p>
                            <p><strong>Comprador:</strong> ${order.shippingAddress?.name || order.shippingAddress?.fullName || 'Cliente'}</p>
                            <table style="width:100%; border-collapse:collapse; margin-top:12px;">
                                <thead>
                                    <tr style="background:#f0f0f0">
                                        <th style="padding:8px;text-align:left">Producto</th>
                                        <th style="padding:8px;text-align:center">Cantidad</th>
                                        <th style="padding:8px;text-align:right">Precio unidad</th>
                                        <th style="padding:8px;text-align:right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rows}
                                </tbody>
                            </table>
                            <p style="margin-top:12px;">Puedes ver y gestionar tu lista en: <a href="${process.env.DOMAIN || 'https://subirananadons.com'}/listas-de-nacimiento/${entries[0].listInfo?.listId || ''}" style="color:#36A9E1">Ir a la lista</a></p>
                            <p style="font-size:12px; color:#666;">Este mensaje se ha enviado automáticamente.</p>
                        </div>`;
                    const mailOptions = {
                        from: 'info@subirananadons.com',
                        to: ownerEmail,
                        subject: `Pedido #${order.orderNumber} - artículos de tu lista`,
                        html: mailHtml
                    };
                    await transporter.sendMail(mailOptions);
                } catch (err) {
                    console.error(`Error sending list-owner email for ownerId ${ownerId}:`, err);
                }
            }
        } catch (error) {
            console.error('Error in sendOrderConfirmationToListOwners:', error);
            throw error;
        }
    }
    static async sendOrderFailedNotification(order, error) {
        try {
            const templateParams = {
                to_email: order.shippingAddress.email,
                to_name: `${order.shippingAddress.name} ${order.shippingAddress.lastName}`,
                order_number: order.orderNumber,
                error_message: error.message || 'Error desconocido'
            };
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                TEMPLATES.ORDER_FAILED,
                templateParams
            );
        } catch (error) {
            console.error('Error sending order failed email:', error);
            throw error;
        }
    }
    static async sendListCreationConfirmation(list, user) {
        try {
            const items_list = list.items.map(item =>
                `<tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product.name}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.reserved || 0}</td>
                </tr>`
            ).join('');
            // Email to list owner <p>Hola ${list.Creator},</p> <p><strong>Estado:</strong> ${list.isPublic ? 'Pública' : 'Privada'}</p>
            const userMailOptions = {
                from: "info@subirananadons.com",
                to: list.email,
                subject: `Tu lista de nacimiento "${list.title}" ha sido creada - Subirana Nadons`,
                html: `
                    <h1>¡Tu lista de nacimiento ha sido creada con éxito!</h1>
                    <p>Tu lista de nacimiento ha sido creada y está lista para ser compartida.</p>
                    <h2>Detalles de la lista:</h2>
                    <p><strong>Título:</strong> ${list.title}</p>
                    <p><strong>Nombre del bebé:</strong> ${list.babyName}</p>
                    <p><strong>Fecha prevista:</strong> ${new Date(list.dueDate).toLocaleDateString('es-ES')}</p>
                    <p><strong>Enlace a tu lista:</strong> <a href="${process.env.DOMAIN}/listas-de-nacimiento/${list._id}" style="color: #36A9E1; text-decoration: underline;">Ver mi lista de nacimiento</a></p>
                    <p><strong>ID a tu lista:</strong> <a href="${process.env.DOMAIN}/listas-de-nacimiento/${list._id}" style="color: #36A9E1; text-decoration: underline;">${list._id}</a></p>
                    <p>Puedes compartir el enlace de tu lista con familiares y amigos usando esta dirección:<br/>
                    <span style="background-color: #f5f5f5; padding: 8px; display: block; margin: 8px 0; border-radius: 4px; word-break: break-all;">${process.env.DOMAIN}/listas-de-nacimiento/${list._id}</span></p>
                    <p>También puedes buscar tu lista usando este ID en el buscador de listas de nacimiento.</p>
                    <p>Gestiona tu lista desde tu perfil de tienda.</p>
                    <p>Gracias por confiar en Subirana Nadons.</p>
                `
            };
            // Email to admin
            const adminMailOptions = {
                from: "info@subirananadons.com",
                to: "info@subirananadons.com",
                subject: `Nueva lista de nacimiento creada - ${list.title}`,
                html: `
                    <h1>¡Tu lista de nacimiento ha sido creada con éxito!</h1>
                    <p>Tu lista de nacimiento ha sido creada y está lista para ser compartida.</p>
                    <h2>Detalles de la lista:</h2>
                    <p><strong>Título:</strong> ${list.title}</p>
                    <p><strong>Nombre del bebé:</strong> ${list.babyName}</p>
                    <p><strong>Fecha prevista:</strong> ${new Date(list.dueDate).toLocaleDateString('es-ES')}</p>
                    <p><strong>Enlace a tu lista:</strong> <a href="${process.env.DOMAIN}/listas-de-nacimiento/${list._id}" style="color: #36A9E1; text-decoration: underline;">Ver mi lista de nacimiento</a></p>
                    <p><strong>ID a tu lista:</strong> <a href="${process.env.DOMAIN}/listas-de-nacimiento/${list._id}" style="color: #36A9E1; text-decoration: underline;">${list._id}</a></p>
                    <p>Puedes compartir el enlace de tu lista con familiares y amigos usando esta dirección:<br/>
                    <span style="background-color: #f5f5f5; padding: 8px; display: block; margin: 8px 0; border-radius: 4px; word-break: break-all;">${process.env.DOMAIN}/es/listas-de-nacimiento/${list._id}</span></p>
                    <p>También puedes buscar tu lista usando este ID en el buscador de listas de nacimiento.</p>
                    <p>Gestiona tu lista desde tu perfil de tienda.</p>
                    <p>Gracias por confiar en Subirana Nadons.</p>
                `
            };
            // Send both emails
            await Promise.all([
                transporter.sendMail(userMailOptions),
                transporter.sendMail(adminMailOptions)
            ]);
        } catch (error) {
            console.error('Error sending list creation email:', error);
            throw error;
        }
    }
    static async sendContactFormEmail(formData) {
        try {
            const mailOptions = {
                from: "info@subirananadons.com",
                to: "info@subirananadons.com",
                subject: formData.subject || "Consulta general desde el formulario de contacto",
                html: `
                    <h1 style="color:#36A9E1;">Nuevo mensaje de contacto</h1>
                    <p><strong>Nombre:</strong> ${formData.name}</p>
                    <p><strong>Email:</strong> ${formData.email}</p>
                    <p><strong>Teléfono:</strong> ${formData.phone || 'No proporcionado'}</p>
                    <p><strong>Asunto:</strong> ${formData.subject || 'Consulta general'}</p>
                    <h2 style="margin-top:24px;">Mensaje:</h2>
                    <div style="background:#f8f9fa; padding:16px; border-radius:8px; border:1px solid #eee; font-size:16px;">${formData.message.replace(/\n/g, '<br>')}</div>
                    <br>
                    <p style="font-size:13px;color:#888;">Este mensaje ha sido enviado desde el formulario de contacto de Subirana Nadons.</p>
                `
            };
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending contact form email:', error);
            throw error;
        }
    }
    static async sendPasswordResetEmail(email, resetToken) {
        try {
            // Determine base URL based on environment
            let baseUrl;
            if (process.env.NODE_ENV === 'development') {
                baseUrl = 'http://localhost:3000';
            } else {
                // Use your production domain (prefer HTTPS)
                baseUrl = 'https://subirananadons.com';
                // If you want to support both, you could add logic here
                // baseUrl = process.env.PROD_URL || 'https://subirananadons.com';
            }
            const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
            const mailOptions = {
                from: "info@subirananadons.com",
                to: email,
                subject: 'Restablecer contraseña - Subirana Nadons',
                html: `
                    <h1>Restablecer contraseña</h1>
                    <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
                    <p><a href="${resetUrl}" style="padding: 10px 20px; background-color: #36A9E1; color: white; text-decoration: none; border-radius: 5px;">Restablecer contraseña</a></p>
                    <p><strong>IMPORTANTE:</strong> Este es un enlace de un solo uso y expirará en 1 hora.</p>
                    <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje.</p>
                    <br>
                    <p>Saludos,<br>El equipo de Subirana Nadons</p>
                `
            };
            // Send email
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending password reset email:', error);
            throw error;
        }
    }
    /**
     * Accepts all modal data and filters/prepares the email payload internally.
     */
    static async sendGiftPurchaseNotification(selectedList, item, action) {
        console.log('sendGiftPurchaseNotification called with:', selectedList, item, action);
        try {
            const list = selectedList.rawData || selectedList;
            // Owner info
            const ownerName = (list.Creator || list.ownerName || (list.user && list.user.name) || list.owner || list.title) || 'Propietario';
            const ownerEmail = (list.email || (list.user && list.user.email)) || '';
            // Product info
            const product = (item && item.product) || {};
            const productName = product?.name?.es || product?.name?.ca || product?.name || 'Producto';
            const productRef = product?.reference || '-';
            const productBrand = product?.brand || '-';
            const productPrice = product?.price_incl_tax ? `${product.price_incl_tax} €` : '-';
            const listTitle = list.title || '';
            const babyName = list.babyName || '';
            // Buyer info
            const buyerInfo = (item && item.userData) || {};
            const buyer = {
                name: buyerInfo.name || '-',
                email: buyerInfo.email || '-',
                phone: buyerInfo.phone || '-',
                message: buyerInfo.message || 'Sin mensaje'
            };
            const listUrl = `${process.env.DOMAIN || 'https://subirananadons.com'}/listas-de-nacimiento/${list._id}`;
            let html = '';
            if (action === 'reserve') {
                html = `
                    <div style="font-family: Arial, sans-serif; background: #f8f9fa; padding: 24px;">
                        <h2 style="color: #36A9E1;">Producto reservado en tu lista</h2>
                        <p>Hola ${ownerName},</p>
                        <p>El producto <strong>${productName}</strong> ha sido <strong>reservado</strong> en tu lista <strong>${listTitle}</strong>.</p>
                        <p><strong>Referencia:</strong> ${productRef}</p>
                        <p><strong>Marca:</strong> ${productBrand}</p>
                        <p><strong>Precio:</strong> ${productPrice}</p>
                        <p><strong>Nombre del bebé:</strong> ${babyName}</p>
                        <p><a href="${listUrl}" style="color: #36A9E1; text-decoration: underline; font-weight: 500;">Revísalo en el panel de tu lista</a></p>
                        <hr style="margin: 16px 0;">
                        <p style="font-size: 13px; color: #888;">Este mensaje ha sido enviado automáticamente por Subirana Nadons.</p>
                    </div>
                `;
            } else {
                html = `
                    <div style="font-family: Arial, sans-serif; background: #f8f9fa; padding: 24px;">
                        <h2 style="color: #36A9E1;">¡Producto comprado en tu lista!</h2>
                        <p>Hola ${ownerName},</p>
                        <p>El producto <strong>${productName}</strong> ha sido <strong>comprado</strong> en tu lista <strong>${listTitle}</strong>.</p>
                        <p><strong>Referencia:</strong> ${productRef}</p>
                        <p><strong>Marca:</strong> ${productBrand}</p>
                        <p><strong>Precio:</strong> ${productPrice}</p>
                        <p><strong>Nombre del bebé:</strong> ${babyName}</p>
                        <p><a href="${listUrl}" style="color: #36A9E1; text-decoration: underline; font-weight: 500;">Revísalo en el panel de tu lista</a></p>
                        <hr style="margin: 16px 0;">
                        <p><strong>Comprador:</strong> ${buyer.name}</p>
                        <p><strong>Email:</strong> ${buyer.email}</p>
                        <p><strong>Teléfono:</strong> ${buyer.phone}</p>
                        <p><strong>Mensaje del comprador:</strong></p>
                        <div style="background: #fff; border-radius: 8px; padding: 12px; border: 1px solid #eee; margin-bottom: 16px;">${buyer.message}</div>
                        <p style="font-size: 13px; color: #888;">Este mensaje ha sido enviado automáticamente por Subirana Nadons.</p>
                    </div>
                `;
            }
            const mailOptions = {
                from: "info@subirananadons.com",
                to: ownerEmail,
                subject: action === 'reserve'
                    ? `Producto reservado en tu lista - ${listTitle}`
                    : `Producto comprado en tu lista - ${listTitle}`,
                html
            };
            if (!mailOptions.to) {
                throw new Error("No recipient email defined for gift notification");
            }
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending gift notification email:', error);
            throw error;
        }
    }
    /**
    * Sends an email to the list owner when a product reservation or purchase is cancelled.
    * Accepts the entire list data and   finds the cancelled item.
    * @param {Object} selectedList - The full list data (with rawData/items)
    * @param {Object} [cancelledItem] - Optionally, the cancelled item (if not, will find first with state 0)
    */
    static async sendGiftCancelNotification(selectedList, cancelledItem = null) {
        console.log('sendGiftCancelNotification called with:', selectedList, cancelledItem);
        try {
            const list = selectedList.rawData || selectedList;
            // Find the first item with state 0 (cancelled) if not provided
            const item = cancelledItem || (Array.isArray(list.items) ? list.items.find(i => i.state === 0) : null);
            const ownerName = (list.Creator || list.ownerName || (list.user && list.user.name) || list.owner || list.title) || 'Propietario';
            const ownerEmail = (list.email || (list.user && list.user.email)) || '';
            const product = (item && item.product) || {};
            const productName = product?.name?.es || product?.name?.ca || product?.name || 'Producto';
            const listTitle = list.title || '';
            const babyName = list.babyName || '';
            // Buyer info (if available)
            const buyerInfo = (item && item.userData) || {};
            const buyer = {
                name: buyerInfo.name || '-',
                email: buyerInfo.email || '-',
                phone: buyerInfo.phone || '-',
                message: buyerInfo.message || 'Sin mensaje'
            };
            // Build HTML template
            const listUrl = `${process.env.DOMAIN || 'https://subirananadons.com'}/listas-de-nacimiento/${list._id}`;
            const html = `
                <div style="font-family: Arial, sans-serif; background: #f8f9fa; padding: 24px;">
                    <h2 style="color: #e41e31;">Reserva/compra cancelada en tu lista</h2>
                    <p>Hola ${ownerName},</p>
                    <p>
                        La reserva o compra del producto <strong>${productName}</strong> ha sido <strong>cancelada</strong> en tu lista <strong>${listTitle}</strong>.
                    </p>
                    <p><strong>Nombre del bebé:</strong> ${babyName}</p>
                    <p><a href="${process.env.DOMAIN}/dashboard/listas" style="color: #36A9E1; text-decoration: underline; font-weight: 500;">Editar tu lista aquí</a></p>
                    <hr style="margin: 16px 0;">
                    <p style="font-size: 13px; color: #888;">Este mensaje ha sido enviado automáticamente por Subirana Nadons.</p>
                </div>
            `;
            const mailOptions = {
                from: "info@subirananadons.com",
                to: ownerEmail,
                subject: `Reserva/compra cancelada en tu lista - ${listTitle}`,
                html
            };
            if (!mailOptions.to) {
                throw new Error("No recipient email defined for gift cancel notification");
            }
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending gift cancel notification:', error);
            throw error;
        }
    }
}
export default EmailService;