// worker.js
import { EmailMessage } from "cloudflare:email";

export default {
    async fetch(request, env) {
        // CORS Headers for cross-origin requests
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Handle preflight requests
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        if (request.method !== "POST") {
            return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
        }

        try {
            // Support both JSON and FormData submissions
            const contentType = request.headers.get('Content-Type') || '';
            let data = {};

            if (contentType.includes('application/json')) {
                data = await request.json();
            } else {
                const formData = await request.formData();
                for (const [key, value] of formData.entries()) {
                    // Handle multiple values with same name (checkboxes)
                    if (data[key]) {
                        if (Array.isArray(data[key])) {
                            data[key].push(value);
                        } else {
                            data[key] = [data[key], value];
                        }
                    } else {
                        data[key] = value;
                    }
                }
            }

            // Extract common fields for special handling
            const senderEmail = data.email || data.Email || null;
            const formSubject = data._subject || data.subject || 'New Form Submission';

            // Format field value based on type
            const formatValue = (value) => {
                if (value === null || value === undefined || value === '') {
                    return 'Not provided';
                }
                if (Array.isArray(value)) {
                    return value.length > 0 ? value.join(', ') : 'None selected';
                }
                if (typeof value === 'boolean') {
                    return value ? 'Yes' : 'No';
                }
                if (typeof value === 'object') {
                    return Object.entries(value)
                        .map(([k, v]) => `  ${formatLabel(k)}: ${formatValue(v)}`)
                        .join('\n');
                }
                return String(value);
            };

            // Convert field names to readable labels
            const formatLabel = (key) => {
                return key
                    .replace(/^_/, '')             // Remove leading underscore
                    .replace(/([A-Z])/g, ' $1')    // Add space before capitals
                    .replace(/[_-]/g, ' ')         // Replace underscores/dashes with spaces
                    .replace(/\b\w/g, c => c.toUpperCase())
                    .trim();
            };

            // Build email body dynamically
            let emailBody = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${formSubject.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

            // Priority fields to show first (if they exist)
            const priorityFields = [
                'name', 'firstName', 'first_name', 'lastName', 'last_name',
                'email', 'phone', 'company', 'subject'
            ];
            const processedFields = new Set();

            // Add priority fields first
            for (const field of priorityFields) {
                if (data[field] !== undefined) {
                    emailBody += `${formatLabel(field)}: ${formatValue(data[field])}\n`;
                    processedFields.add(field);
                }
            }

            // Add separator if we had priority fields
            if (processedFields.size > 0) {
                emailBody += '\n───────────────────────────────────────\n\n';
            }

            // Add remaining fields
            for (const [key, value] of Object.entries(data)) {
                // Skip already processed fields and internal fields
                if (processedFields.has(key) || key.startsWith('_')) continue;

                const formattedValue = formatValue(value);

                // Special formatting for long text (like messages)
                if (typeof value === 'string' && value.length > 100) {
                    emailBody += `${formatLabel(key)}:\n${value}\n\n`;
                } else if (typeof value === 'object' && !Array.isArray(value)) {
                    emailBody += `${formatLabel(key)}:\n${formattedValue}\n\n`;
                } else {
                    emailBody += `${formatLabel(key)}: ${formattedValue}\n`;
                }
            }

            // Add metadata footer
            emailBody += `
───────────────────────────────────────
Submitted: ${new Date().toLocaleString('en-US', {
                timeZone: 'America/New_York',
                dateStyle: 'full',
                timeStyle: 'short'
            })}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

            // REPLACE WITH YOUR ACTUAL VERIFIED DOMAIN EMAIL
            const msg = new EmailMessage(
                "contact@yourwebsite.com",
                "contact@yourwebsite.com",
                emailBody
            );

            // Set Reply-To if sender email provided
            if (senderEmail) {
                msg.headers.set("Reply-To", senderEmail);
            }

            await env.EMAIL.send(msg);

            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });

        } catch (e) {
            return new Response(JSON.stringify({ success: false, error: e.message }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    },
};
