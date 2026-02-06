# Cloudflare Worker Contact Form

This project sets up a simple contact form that uses a Cloudflare Worker to send emails via Cloudflare Email Routing.

## Setup Instructions

### 1. Prerequisites
- A Cloudflare account
- A domain name added to Cloudflare
- Email Routing enabled and configured in Cloudflare

### 2. Configure Worker
1.  Go to **Workers & Pages** in your Cloudflare Dashboard.
2.  Create a new Worker (e.g., `contact-form-worker`).
3.  Go to **Settings > Bindings**.
4.  Add a **Send Email** binding:
    -   **Variable Name**: `EMAIL`
    -   **Destination Address**: Select your verified Gmail address (or other verified destination).

### 3. Deploy Code
Copy the content of `worker.js` into your Worker's code editor, or deploy using Wrangler:

```bash
npx wrangler deploy
```

> **IMPORTANT**: You must update the `sender` and `recipient` email addresses in `worker.js` before deploying!
> - `sender`: Must be an address on your verified domain (e.g., `forms@yourdomain.com`).
> - `recipient`: Must be a verified destination address.

### 4. Create the Form
1.  Copy `index.example.html` to `index.html`:
    ```bash
    cp index.example.html index.html
    ```
2.  Open `index.html` and replace `{{WORKER_URL}}` with your actual Worker URL:
    ```html
    <form action="https://your-worker-name.your-subdomain.workers.dev" method="POST">
    ```

> **Note:** `index.html` is in `.gitignore` to prevent your private Worker URL from being committed to the repository.

### 5. Test
Open `index.html` in your browser, fill out the form, and submit. You should receive an email in your verified destination inbox.

## Project Structure
- `index.example.html`: The HTML template with the form.
- `index.html`: Your local form file (do not commit).
- `worker.js`: The Cloudflare Worker logic.
- `.env`: (Optional) Stores environment variables.
