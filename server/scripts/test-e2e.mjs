import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('--- Starting End-to-End Verification ---');

const { default: connectDB } = await import('../src/config/db.js');
const { default: app } = await import('../src/app.js');

await connectDB();

const server = app.listen(0);
const port = server.address().port;
const API = `http://127.0.0.1:${port}/api`;
console.log(`Test server running at ${API}`);

try {
    // Test 1: Health Check
    console.log('\n[1/7] Testing Health Check...');
    const healthRes = await fetch(`${API}/health`);
    const health = await healthRes.json();
    if (!health.success) throw new Error('Health check failed');
    console.log('✅ Health check passed:', health.message);

    // Test 2: User Registration
    const testEmail = `test_${Date.now()}@documind.test`;
    const testPassword = 'Password123!';
    const testName = 'Test User';
    console.log(`\n[2/7] Registering new user: ${testEmail}...`);

    const registerRes = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: testName, email: testEmail, password: testPassword })
    });
    const registerData = await registerRes.json();
    if (!registerRes.ok || !registerData.success) {
        throw new Error(`Registration failed: ${JSON.stringify(registerData)}`);
    }
    const token = registerData.token || registerData.sessionId;
    if (!token) throw new Error('No token returned from registration');
    console.log('✅ User registered successfully. User ID:', registerData.user.id);
    console.log('✅ Token received:', token);

    // Test 3: Authenticated Request with Bearer Token
    console.log('\n[3/7] Testing Protected Profile Endpoint with Bearer token...');
    const profileRes = await fetch(`${API}/user/profile`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const profileData = await profileRes.json();
    if (!profileRes.ok || !profileData.success) {
        throw new Error(`Profile fetch failed: ${JSON.stringify(profileData)}`);
    }
    console.log('✅ Protected endpoint verified. User profile:', profileData.user.name, profileData.user.email);

    // Test 4: Document Upload
    console.log('\n[4/7] Testing Document Upload...');
    const samplePdfPath = path.join(__dirname, '../../Lecture 01 PDF 1.pdf');
    if (!fs.existsSync(samplePdfPath)) {
        throw new Error(`Sample PDF not found at ${samplePdfPath}`);
    }

    const fileBuffer = fs.readFileSync(samplePdfPath);
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    const form = new FormData();
    form.append('file', blob, 'Lecture 01 PDF 1.pdf');

    const uploadRes = await fetch(`${API}/documents/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: form
    });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok || !uploadData.success) {
        throw new Error(`Upload failed: ${JSON.stringify(uploadData)}`);
    }
    const documentId = uploadData.document.documentId;
    console.log(`✅ Document uploaded. ID: ${documentId}, status: ${uploadData.document.status}`);

    // Test 5: Poll Document Status until Completed
    console.log('\n[5/7] Waiting for document processing to complete...');
    let documentStatus = uploadData.document.status;
    let attempts = 0;
    while (documentStatus !== 'completed' && documentStatus !== 'failed' && attempts < 35) {
        await new Promise(r => setTimeout(r, 1000));
        attempts++;
        const statusRes = await fetch(`${API}/documents/${documentId}/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const statusData = await statusRes.json();
        documentStatus = statusData.document.status;
        console.log(`  Attempt ${attempts}: status = ${documentStatus}, progress = ${statusData.document.progress}% (${statusData.document.statusMessage})`);
    }

    if (documentStatus !== 'completed') {
        throw new Error(`Document processing ended in unexpected state: ${documentStatus}`);
    }
    console.log('✅ Document processing completed successfully!');

    // Test 6: Document Preview
    console.log('\n[6/7] Testing Document Preview...');
    const previewRes = await fetch(`${API}/documents/${documentId}/preview`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const previewData = await previewRes.json();
    if (!previewRes.ok || !previewData.success) {
        throw new Error(`Preview failed: ${JSON.stringify(previewData)}`);
    }
    console.log('✅ Preview fetched successfully. Length of preview text:', previewData.text?.length);

    // Test 7: Chat / Question Answering (RAG)
    console.log('\n[7/7] Testing RAG Chat Question...');
    const question = 'What is discussed in this document? Give a brief summary.';
    const chatRes = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            documentId,
            question
        })
    });
    const chatData = await chatRes.json();
    if (!chatRes.ok || !chatData.success) {
        throw new Error(`Chat failed: ${JSON.stringify(chatData)}`);
    }
    console.log('✅ Chat response generated successfully:');
    console.log('--- Answer Preview ---');
    console.log(chatData.answer.slice(0, 300) + '...');
    console.log('----------------------');

    // Test 8: Recent Chats & User Dashboard
    const recentChatsRes = await fetch(`${API}/chat/recent`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const recentChatsData = await recentChatsRes.json();
    console.log('✅ Recent chats retrieved. Count:', recentChatsData.chats?.length);

    const userDocsRes = await fetch(`${API}/user/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const userDocsData = await userDocsRes.json();
    console.log('✅ User dashboard documents retrieved. Count:', userDocsData.documents?.length);

    // Test 9: Logout
    console.log('\n[Bonus] Testing Logout...');
    const logoutRes = await fetch(`${API}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const logoutData = await logoutRes.json();
    console.log('✅ Logout response:', logoutData.message);

    console.log('\n🎉 ALL END-TO-END TESTS PASSED SUCCESSFULLY! 🎉');

} finally {
    server.close();
    process.exit(0);
}
