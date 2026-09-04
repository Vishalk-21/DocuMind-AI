# DocuMind AI Deployment Guide

This guide deploys the full DocuMind AI application with:

- React and Vite frontend on Render Static Site
- Node.js and Express backend on Render Web Service
- MongoDB Atlas for application data
- Qdrant Cloud for vector search
- Neo4j Aura for graph data
- Render Persistent Disk for uploaded files during the first production deployment
- Gmail SMTP, Resend, Postmark, or SendGrid for OTP email

For a larger production installation, move uploaded files to Amazon S3 or Cloudflare R2 and move document processing to a durable job queue.

---

## 1. Important Security Step

The existing `server/.env` contains credentials that look like real secrets. Before deploying:

1. Rotate the MongoDB password.
2. Revoke and recreate the Gemini API key.
3. Revoke and recreate the Groq API key.
4. Revoke and recreate the Cerebras API key.
5. Revoke and recreate the Qdrant API key.
6. Create a new SMTP app password.
7. Generate a new JWT secret.
8. Change the Neo4j password.
9. Do not reuse credentials from the current environment file.

Never put server secrets in frontend variables beginning with `VITE_`. Vite variables are visible in the browser.

---

## 2. Protect Secrets With Git Ignore

The root `.gitignore` must contain:

```gitignore
node_modules/
.env
.env.*
!.env.example
uploads/
dist/
.DS_Store
```

Check whether an environment file is tracked:

```powershell
git status
git ls-files | Select-String "\.env"
```

The command should not show `server/.env`.

If credentials were ever committed, rotate them even if the file is later deleted. Removing a file from the latest commit does not remove it from Git history.

---

## 3. Create MongoDB Atlas

1. Open MongoDB Atlas.
2. Create a production cluster.
3. Create a database user with a strong password.
4. Allow the IP address of the backend host.
5. For an initial Render deployment, you can temporarily allow `0.0.0.0/0`.
6. Restrict the access list later when your hosting provider IP policy is known.
7. Copy the connection string.

Example:

```text
mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/docuMindAI
```

Use this value as `MONGO_URI` on the backend.

Recommended MongoDB production settings:

- Enable automated backups.
- Use a separate production database user.
- Do not use the Atlas owner account in the application.
- Monitor connection count and storage.

---

## 4. Create Qdrant Cloud

1. Create a Qdrant Cloud cluster.
2. Create or initialize the collection required by the application.
3. Confirm the vector dimension matches the selected embedding model.
4. Create an API key.
5. Copy the cluster URL and API key.

Required backend values:

```env
QDRANT_URL=https://your-cluster-url
QDRANT_API_KEY=your-production-qdrant-key
```

Do not use a local Qdrant URL after deployment unless Qdrant runs on the same private server.

---

## 5. Create Neo4j Aura

1. Open Neo4j Aura.
2. Create a production database.
3. Set a strong database password.
4. Copy the Bolt URI, username, and password.

Production values look similar to:

```env
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-production-password
```

Do not use this local development value in production:

```env
NEO4J_URI=neo4j://127.0.0.1:7687
```

The current Docker value `neo4j/password` is suitable only for local development and must be changed.

---

## 6. Configure Email Delivery

DocuMind uses email OTPs for registration, login, password reset, and admin login.

You can use Gmail for the first deployment:

1. Enable two-factor authentication on the Gmail account.
2. Create a Google App Password.
3. Use the App Password as `SMTP_PASS`.

Recommended production email providers include Resend, Postmark, and SendGrid.

Example SMTP variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-production-email@gmail.com
```

Do not use your normal Gmail password.

---

## 7. Fix the Frontend API URL

The frontend currently contains hard-coded `http://localhost:5000/api` URLs. These must be replaced before deployment.

Affected areas include:

- `client/src/services/api.js`
- `client/src/services/authApi.js`
- `client/src/pages/UserDashboard.jsx`
- `client/src/pages/AdminDashboard.jsx`

Use a frontend environment variable:

```js
const API_URL = `${import.meta.env.VITE_API_URL}/api`;
```

For local development, create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

For production, configure the frontend hosting service with:

```env
VITE_API_URL=https://api.yourdomain.com
```

Any request currently using a relative path such as `/api/user/profile` must use the production API base URL as well when the frontend and backend are hosted separately.

---

## 8. Protect Document Routes

The document upload, status, and preview routes must require authentication before the application is public.

In `server/src/routes/document.routes.js`, use `authMiddleware` for these routes:

```js
import { authMiddleware } from "../middleware/auth.middleware.js";

router.post(
    "/upload",
    authMiddleware,
    uploadLimiter,
    upload.single("file"),
    uploadDocument
);

router.get(
    "/:documentId/preview",
    authMiddleware,
    getDocumentPreview
);

router.get(
    "/:documentId/status",
    authMiddleware,
    getDocumentStatus
);
```

Without this change, an unauthenticated request can attempt to access document endpoints.

---

## 9. Add Document Ownership

The current `Document` model does not contain a user owner. Add this field to `server/src/models/Document.js`:

```js
userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
},
```

When creating a document, save the authenticated user:

```js
userId: req.user._id
```

Every document lookup must include both the document ID and the authenticated user ID:

```js
{
    documentId,
    userId: req.user._id
}
```

Apply this rule to:

- Duplicate document lookup
- Upload retry lookup
- Document status
- Document preview
- Chat requests
- Vector retrieval
- Graph retrieval
- Document lists
- Delete operations

This prevents one user from accessing another user’s document by guessing an ID.

Test this with two separate accounts before launch.

---

## 10. Configure Uploaded File Storage

The current application writes uploads to a local `uploads` directory. Cloud instances may lose local files during redeploys or restarts.

At minimum, make the upload directory configurable:

```js
const uploadDir = process.env.UPLOAD_DIR || "uploads";
```

For the first Render deployment:

1. Add a persistent disk to the backend service.
2. Mount it at:

```text
/var/data
```

3. Set this environment variable:

```env
UPLOAD_DIR=/var/data/uploads
```

For a scalable deployment, use object storage instead:

- Amazon S3
- Cloudflare R2
- Google Cloud Storage

Store the object key in MongoDB rather than relying on a local file path.

---

## 11. Prepare Backend Environment Variables

Configure these variables on the backend hosting service:

```env
NODE_ENV=production
PORT=10000
CLIENT_ORIGIN=https://app.yourdomain.com

MONGO_URI=mongodb+srv://...

GEMINI_API_KEY=...
QDRANT_URL=https://...
QDRANT_API_KEY=...

NEO4J_URI=neo4j+s://...
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=...

JWT_SECRET=long-random-production-secret

GROQ_API_KEY=...
GROQ_CHAT_MODEL=llama-3.3-70b-versatile
GROQ_SUMMARY_MODEL=llama-3.3-70b-versatile
GROQ_GRAPH_MODEL=llama-3.3-70b-versatile

CEREBRAS_API_KEY=...
CEREBRAS_CHAT_MODEL=llama3.1-8b
CEREBRAS_SUMMARY_MODEL=llama3.1-8b
CEREBRAS_GRAPH_MODEL=llama3.1-8b

GEMINI_CHAT_MODEL=gemini-3.6-flash
GEMINI_SUMMARY_MODEL=gemini-3.6-flash
GEMINI_GRAPH_MODEL=gemini-3.6-flash

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-production-email@gmail.com

UPLOAD_DIR=/var/data/uploads
```

The frontend must never receive these values.

---

## 12. Deploy the Backend to Render

1. Push the repository to GitHub.
2. Open Render.
3. Create a new Web Service.
4. Select the GitHub repository.
5. Set the root directory to:

```text
server
```

6. Set the build command:

```bash
npm ci
```

7. Set the start command:

```bash
npm start
```

8. Add the backend environment variables.
9. Add a persistent disk mounted at `/var/data` if using local upload storage.
10. Deploy the service.

The server already uses the hosting provider’s `PORT` variable in `server/src/server.js`.

After deployment, the backend URL will look similar to:

```text
https://your-backend-name.onrender.com
```

Test the health endpoint:

```text
https://your-backend-name.onrender.com/api/health
```

Expected response:

```json
{
    "success": true,
    "message": "DocuMind API is running"
}
```

---

## 13. Deploy the Frontend to Render

1. In Render, create a new Static Site.
2. Select the same GitHub repository.
3. Set the root directory to:

```text
client
```

4. Set the build command:

```bash
npm ci && npm run build
```

5. Set the publish directory:

```text
dist
```

6. Add this environment variable:

```env
VITE_API_URL=https://your-backend-name.onrender.com
```

7. Deploy the static site.

Because the application uses React Router, add a rewrite rule:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```

Without this rewrite, refreshing `/login`, `/account`, or another client route may return a 404.

The frontend URL will look similar to:

```text
https://your-frontend-name.onrender.com
```

---

## 14. Configure CORS

Set this backend variable to the exact frontend URL:

```env
CLIENT_ORIGIN=https://your-frontend-name.onrender.com
```

For a custom domain:

```env
CLIENT_ORIGIN=https://app.yourdomain.com
```

Do not use `*` for CORS when cookies are enabled.

The frontend authenticated requests must continue using:

```js
credentials: "include"
```

---

## 15. Configure Cookies

The authentication cookie is configured as HTTP-only and secure in production.

If the frontend and backend are deployed on different sites, verify the browser accepts the cookie. Depending on your final domain setup, the cookie may need:

```js
sameSite: "none",
secure: true
```

If both services use the same parent domain, such as `app.yourdomain.com` and `api.yourdomain.com`, test the current configuration first.

After login, inspect the browser Application or Storage panel and confirm that `documind_session` exists.

---

## 16. Configure Custom Domains

Recommended DNS setup:

```text
app.yourdomain.com  -> frontend hosting service
api.yourdomain.com  -> backend hosting service
```

After DNS and SSL are active, update:

Frontend variable:

```env
VITE_API_URL=https://api.yourdomain.com
```

Backend variable:

```env
CLIENT_ORIGIN=https://app.yourdomain.com
```

Redeploy the frontend after changing `VITE_API_URL`, because Vite embeds that value during the build.

---

## 17. Push the Project to GitHub

From the project root:

```powershell
git init
git add .
git commit -m "Prepare DocuMind for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/documind-ai.git
git push -u origin main
```

Before pushing:

```powershell
git status
git ls-files | Select-String "\.env"
```

Verify that no production environment file is tracked.

---

## 18. Production Smoke Tests

### Backend health

Open:

```text
https://api.yourdomain.com/api/health
```

Confirm status `200`.

### Registration

1. Open the frontend.
2. Register a new account.
3. Confirm the OTP email arrives.
4. Enter the OTP.
5. Confirm the account becomes authenticated.

### Login

1. Log out.
2. Log in again.
3. Enter the login OTP.
4. Refresh the browser.
5. Confirm the session remains active.

### Upload and processing

1. Upload a small PDF.
2. Confirm an ID is returned.
3. Confirm processing status changes.
4. Confirm the document reaches `completed`.
5. Open the document preview.
6. Ask a question about content that is clearly present.
7. Confirm the answer is relevant.
8. Refresh the page and confirm the chat remains available.

### Chat history

1. Ask multiple questions.
2. Log out and log back in.
3. Confirm recent chats load.
4. Open a previous chat.
5. Confirm the associated document is available.

### Authorization test

1. Create User A.
2. Upload a document as User A.
3. Copy the document ID.
4. Create User B.
5. Attempt to request User A’s status, preview, or chat using User B’s session.
6. Confirm the request returns `401` or `403`.

Do not launch publicly until this test passes.

---

## 19. Common Deployment Errors

### The browser says it cannot connect to the server

Check:

- `VITE_API_URL` is set.
- The frontend was rebuilt after changing `VITE_API_URL`.
- The backend service is running.
- CORS uses the exact frontend origin.
- The frontend is not still calling `localhost`.

### Login works but later requests are unauthenticated

Check:

- `credentials: "include"` is present.
- The cookie exists in the browser.
- The cookie is marked `Secure` over HTTPS.
- `sameSite` is compatible with the deployment domains.
- CORS has `credentials: true`.

### Files disappear after redeployment

The backend is using temporary local storage. Add a persistent disk or move files to S3/R2.

### Neo4j connection fails

Check:

- `NEO4J_URI` uses the Aura `neo4j+s://` URI.
- The Aura instance is running.
- The production username and password are correct.
- The URI is not `127.0.0.1`.

### Frontend routes return 404 on refresh

Add this static-site rewrite:

```text
/* -> /index.html
```

### OTP email does not arrive

Check:

- SMTP host and port.
- Gmail App Password or provider API credentials.
- `SMTP_FROM`.
- Provider logs.
- Spam and delivery restrictions.

### Document processing is slow or stops

OCR, embedding, graph extraction, and summary generation are CPU- and API-intensive. Check backend logs, provider quotas, memory, and timeout limits. For scale, move processing to a durable worker queue.

---

## 20. Recommended Deployment Order

Complete the work in this order:

1. Rotate all exposed credentials.
2. Add and verify `.gitignore`.
3. Replace hard-coded frontend API URLs.
4. Protect document routes.
5. Add document ownership checks.
6. Create MongoDB Atlas.
7. Create Qdrant Cloud.
8. Create Neo4j Aura.
9. Configure SMTP.
10. Deploy the backend.
11. Verify `/api/health`.
12. Deploy the frontend.
13. Configure the React Router rewrite.
14. Configure CORS and cookies.
15. Add custom domains.
16. Run registration and login tests.
17. Run upload and processing tests.
18. Run the two-user authorization test.
19. Configure backups and monitoring.

---

## 21. Recommended Next Production Improvements

After the first deployment is working:

- Move uploaded files to S3 or Cloudflare R2.
- Move document processing into BullMQ, Redis, or another durable queue.
- Add structured citations to every AI answer.
- Add document deletion and storage cleanup.
- Add request IDs and structured logs.
- Add service health checks for MongoDB, Qdrant, Neo4j, and AI providers.
- Add automated tests for cross-user access.
- Add database backups and restore testing.
- Add usage quotas per user.
- Add monitoring and alerting.

The minimum requirements for a public deployment are credential rotation, production API configuration, authenticated document routes, document ownership, persistent upload storage, correct CORS, and successful two-user authorization testing.
