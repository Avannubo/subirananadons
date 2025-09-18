import EmailService from "@/services/EmailService";
export async function POST(request) {
    try {
        const body = await request.json();
        await EmailService.sendContactFormEmail(body);
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Error sending contact form email:", error);
        return new Response(JSON.stringify({ error: "Failed to send email" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
