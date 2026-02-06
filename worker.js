// worker.js
import { EmailMessage } from "cloudflare:email";

export default {
  async fetch(request, env) {
    // Only allow POST requests (form submissions)
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      // 1. Parse the form data
      const formData = await request.formData();
      const name = formData.get("name");
      const message = formData.get("message");

      // 2. Create the email content
      const emailBody = `
        New Contact Form Submission!
        ---------------------------
        From: ${name}
        Message: ${message}
      `;

      // 3. Send the email using the binding
      // Note: 'sender' must be a domain you own and have verified in Cloudflare
      // REPLACE THESE WITH YOUR ACTUAL EMAILS
      const sender = "forms@yourdomain.com"; // Verified Domain
      const recipient = "your-personal-gmail@gmail.com"; // Verified Destination

      const msg = new EmailMessage(
        sender,
        recipient,
        emailBody
      );

      await env.EMAIL.send(msg);
      
      // Return a simple success page or redirect
      return new Response("Form submitted successfully!", { 
        status: 200,
        headers: {
            "Content-Type": "text/html"
        } 
      });

    } catch (e) {
      return new Response("Error sending email: " + e.message, { status: 500 });
    }
  },
};
