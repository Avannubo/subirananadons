import nodemailer from 'nodemailer';
// Create nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'outlook',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER || "info@subirananadons.com",
        pass: process.env.EMAIL_PASS || "Ton38060"
    }
});
class EmailService {
    static async sendOrderConfirmation(order) {
        try {
            const items_list = order.items.map(item =>
                `<tr>
                    <td>${item.product.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toFixed(2)}€</td>
                </tr>`
            ).join('');
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: order.shippingAddress.email,
                subject: `Confirmación de pedido #${order.orderNumber} - Subirana Nadons`,
                html: `
                    <h1>¡Gracias por tu pedido!</h1>
                    <p>Hola ${order.shippingAddress.name},</p>
                    <p>Tu pedido ha sido confirmado con éxito.</p>
                    <h2>Detalles del pedido:</h2>
                    <p><strong>Número de pedido:</strong> ${order.orderNumber}</p>
                    <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString('es-ES')}</p>
                    <p><strong>Método de entrega:</strong> ${order.deliveryMethod === 'delivery' ? 'Envío a domicilio' : 'Recogida en tienda'}</p>
                    <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="padding: 10px; text-align: left;">Producto</th>
                                <th style="padding: 10px; text-align: left;">Cantidad</th>
                                <th style="padding: 10px; text-align: left;">Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items_list}
                        </tbody>
                        <tfoot>
                            <tr style="background-color: #f8f9fa;">
                                <td colspan="2" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
                                <td style="padding: 10px;">${order.totalAmount.toFixed(2)}€</td>
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
        } catch (error) {
            console.error('Error sending order confirmation email:', error);
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
            const templateParams = {
                to_email: user.email,
                to_name: user.name,
                list_title: list.title,
                baby_name: list.babyName,
                list_url: `${process.env.NEXT_PUBLIC_BASE_URL}/lists/${list._id}`,
                due_date: list.dueDate ? new Date(list.dueDate).toLocaleDateString('es-ES') : 'No especificada'
            };
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                TEMPLATES.LIST_CREATED,
                templateParams
            );
        } catch (error) {
            console.error('Error sending list creation email:', error);
            throw error;
        }
    }
    static async sendContactFormEmail(formData) {
        try {
            const templateParams = {
                from_name: formData.name,
                from_email: formData.email,
                message: formData.message,
                phone: formData.phone || 'No proporcionado',
                subject: formData.subject || 'Consulta general'
            };
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                TEMPLATES.CONTACT_FORM,
                templateParams
            );
        } catch (error) {
            console.error('Error sending contact form email:', error);
            throw error;
        }
    }
    static async sendGiftPurchaseNotification(gift, buyer, listOwner) {
        try {
            const templateParams = {
                to_email: listOwner.email,
                to_name: listOwner.name,
                buyer_name: buyer.name,
                product_name: gift.product.name,
                list_title: gift.listTitle,
                buyer_message: gift.buyerInfo?.note || 'Sin mensaje',
                baby_name: gift.babyName
            };
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                TEMPLATES.GIFT_PURCHASED,
                templateParams
            );
        } catch (error) {
            console.error('Error sending gift purchase notification:', error);
            throw error;
        }
    }
    static async sendPasswordResetEmail(email, resetToken) {
        try {
            const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
            const mailOptions = {
                from: "info@subirananadons.com",
                to: email,
                subject: 'Restablecer contraseña - Subirana Nadons',
                html: `
                    <h1>Restablecer contraseña</h1>
                    <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
                    <p><a href="${resetUrl}" style="padding: 10px 20px; background-color: #00B0C8; color: white; text-decoration: none; border-radius: 5px;">Restablecer contraseña</a></p>
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
}
export default EmailService;
