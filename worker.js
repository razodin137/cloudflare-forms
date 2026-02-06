// worker.js
import { EmailMessage } from "cloudflare:email";

export default {
    async fetch(request, env) {
        if (request.method !== "POST") {
            return new Response("Method Not Allowed", { status: 405 });
        }

        const formData = await request.formData();
        const name = formData.get("name");
        const message = formData.get("message");

        const emailBody = `
      From: ${name}
      Message: ${message}
    `;

        // Sender: admin@yourdomain.com (Must be a verified domain)
        // Recipient: admin@yourdomain.com (Same address! The Catch-all handles the rest)
        // REPLACE WITH YOUR ACTUAL VERIFIED DOMAIN EMAIL
        const msg = new EmailMessage(
            "admin@yourdomain.com",
            "admin@yourdomain.com",
            emailBody
        );

        try {
            await env.EMAIL.send(msg);
            return new Response("Sent!", { status: 200 });
        } catch (e) {
            return new Response("Error: " + e.message, { status: 500 });
        }
    },
};
