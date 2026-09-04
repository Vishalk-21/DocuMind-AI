DOCUMIND AI PROJECT CONTEXT

I am continuing work on the DocuMind-AI project.

PROJECT LOCATION

C:\Users\21230\DocuMind-AI

PROJECT PURPOSE

DocuMind AI is a PDF analysis and question-answering platform.

The user can:

1. Upload a PDF.
2. Extract text from the PDF.
3. Use OCR for scanned pages.
4. Clean and split document text into chunks.
5. Generate Gemini embeddings.
6. Store vectors in Qdrant.
7. Extract entities and relationships using Gemini.
8. Store graph data in Neo4j.
9. Generate a document summary.
10. Ask questions about the PDF.
11. Receive grounded answers with page citations.
12. View the PDF beside the chat.
13. Close the PDF preview to expand the chat.
14. View recent chats and restore previous conversations.

TECHNOLOGY STACK

Frontend:
- React
- Vite
- JavaScript
- react-markdown
- remark-gfm
- lucide-react

Backend:
- Node.js
- Express
- JavaScript
- MongoDB
- Mongoose

AI:
- Gemini API
- @google/genai
- gemini-embedding-001
- gemini-3.6-flash

PDF:
- pdfjs-dist
- @napi-rs/canvas
- Tesseract.js

Databases:
- MongoDB for application data
- Qdrant for vector search
- Neo4j for entities and relationships

DOCKER SERVICES

MongoDB:
localhost:27017

Qdrant:
localhost:6333 for local Docker
Cloud Qdrant currently uses HTTPS port 443

Neo4j:
Bolt URI:
neo4j://127.0.0.1:7687

Neo4j Browser:
http://localhost:7474

Docker containers:

documind-mongodb
documind-qdrant
documind-neo4j

Start Docker services:

cd C:\Users\21230\DocuMind-AI
docker compose up -d

Check Docker containers:

docker ps

NEO4J CONFIGURATION

The current setup uses local Docker Neo4j, not Neo4j Aura.

server/.env:

NEO4J_URI=neo4j://127.0.0.1:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password

Neo4j Browser login:

Username:
neo4j

Password:
password

Neo4j is required for document graph creation and graph retrieval.

If Neo4j is stopped or authentication fails, document processing can fail during graph indexing.

NEO4J GRAPH STRUCTURE

The application creates:

Document
  |
  HAS_PAGE
  |
Page
  |
  HAS_CHUNK
  |
Chunk
  |
  MENTIONS
  |
Entity

Entities can also be connected using:

Entity
  |
  RELATED_TO
  |
Entity

Neo4j stores relationship names in the relation property.

Example:

Ada
  |
RELATED_TO
  |
Example Labs

QDRANT CONFIGURATION

Qdrant stores vector embeddings for document chunks.

Current configuration:

QDRANT_URL=https://your-qdrant-host:443
QDRANT_API_KEY=your_qdrant_api_key

The Qdrant client is configured to use:

- HTTPS
- Port 443
- API key authentication

Qdrant point IDs must be UUIDs or unsigned integers.

The original chunk IDs were strings such as:

document-id-1-0

These are converted into deterministic UUIDs before saving to Qdrant.

Qdrant also requires a keyword index for:

documentId

This index allows vector search to filter results by the active document.

GEMINI CONFIGURATION

Gemini configuration file:

server/src/config/gemini.js

Gemini API key comes from:

GEMINI_API_KEY=your_gemini_api_key

Embedding model:

gemini-embedding-001

Generation model:

gemini-3.6-flash

GEMINI CALLS

Gemini is used in these areas:

1. Document embeddings

Function:
createEmbeddings()

Purpose:
Converts document chunks into vectors.

2. Question embedding

Function:
createEmbedding()

Purpose:
Converts the user question into a vector for Qdrant search.

3. Batch graph extraction

Function:
extractGraphBatch()

Purpose:
Extracts entities and relationships from document chunks.

4. Document summary

Function:
generateSummary()

Purpose:
Creates a Markdown summary of the PDF.

5. Final answer generation

Function:
generateAnswer()

Purpose:
Creates a grounded Markdown answer using document context.

6. Conversation summary

Function:
summarizeConversation()

Purpose:
Summarizes older conversation messages.

7. Layout analysis

Function:
analyzeLayout()

Purpose:
Detects headings, paragraphs, lists, tables, and entities.

This is implemented but not currently part of the main active ingestion flow.

8. Reranking

Function:
rerankChunks()

Purpose:
Ranks retrieved chunks according to question relevance.

This is implemented but not currently part of the main active chat flow.

GEMINI RETRY HANDLING

File:

server/src/utils/gemini.js

Transient Gemini errors are retried:

- 429
- 500
- 502
- 503
- 504

This helps handle temporary Gemini overload errors.

PDF PROCESSING FLOW

The upload flow is:

PDF upload
  |
PDF text extraction
  |
Document classification
  |
OCR fallback if needed
  |
Text cleaning
  |
Chunking
  |
Gemini embeddings
  |
Qdrant vector storage
  |
Batch Gemini graph extraction
  |
Neo4j graph storage
  |
Gemini document summary
  |
Document completed
  |
Chat becomes available

PDF EXTRACTION

Normal text PDFs use PDF.js.

Scanned PDFs use:

PDF.js
  |
@napi-rs/canvas
  |
PNG image
  |
Tesseract OCR
  |
Extracted text

The PDF renderer and OCR were tested successfully.

The original error was:

Value is none of these types String, Path

Cause:

Incompatible versions of pdfjs-dist and @napi-rs/canvas.

Fixed versions:

@napi-rs/canvas@0.1.100
pdfjs-dist@5.6.205

DOCUMENT CLASSIFICATION

The classifier checks how many pages contain meaningful text.

If at least 70 percent of pages contain text:

The document is classified as text.

This prevents unnecessary OCR on mostly text-based PDFs.

If no pages contain text:

The document is classified as scanned.

If some pages contain text and some do not:

The document is classified as mixed.

DOCUMENT UPLOAD API

Endpoint:

POST /api/documents/upload

The backend:

1. Receives the PDF.
2. Saves the file using Multer.
3. Creates a document record in MongoDB.
4. Returns a documentId.
5. Starts processing in the background.
6. Updates processing status in MongoDB.

DOCUMENT STATUS API

Endpoint:

GET /api/documents/:documentId/status

Possible statuses:

uploaded
extracting
classifying
ocr
cleaning
chunking
embedding
vector_indexing
graph_indexing
completed
failed

The frontend polls this endpoint every 1.5 seconds.

CHAT API

Endpoint:

POST /api/chat

Request body:

{
  "documentId": "document-id",
  "chatId": "optional-chat-id",
  "question": "What is this document about?"
}

Chat flow:

User question
  |
Gemini question embedding
  |
Qdrant vector search
  |
Neo4j graph search
  |
Gemini answer generation
  |
Answer saved to MongoDB
  |
Answer returned to React

The answer contains Markdown and is rendered using react-markdown.

RECENT CHAT API

Get recent chats:

GET /api/chat/recent

Get a specific chat history:

GET /api/chat/:chatId

Ask a question:

POST /api/chat

RECENT CHAT IMPLEMENTATION

The Chat model stores:

- chatId
- documentId
- summary
- messages
- status
- createdAt
- updatedAt

Each message stores:

- role
- content
- createdAt

When the user asks the first question:

1. Backend creates a chatId.
2. User question is saved.
3. Gemini answer is saved.
4. chatId is returned to the frontend.

When the user asks another question:

1. Existing chatId is sent.
2. The backend finds the existing chat.
3. New question and answer are appended.
4. The chat updatedAt value changes.

Recent chats are displayed in the sidebar.

Clicking a recent chat:

1. Calls GET /api/chat/:chatId.
2. Loads saved messages.
3. Restores the conversation in ChatBox.
4. Sets the active documentId.

FRONTEND STRUCTURE

client/src/

components:
- ChatBox.jsx
- Citation.jsx
- DocumentCard.jsx
- Message.jsx
- Navbar.jsx
- PdfViewer.jsx
- ProcessingStatus.jsx
- Summary.jsx
- UploadBox.jsx

hooks:
- useDocumentStatus.js

pages:
- Home.jsx

services:
- api.js

Important frontend files:

client/src/pages/Home.jsx
client/src/components/ChatBox.jsx
client/src/components/UploadBox.jsx
client/src/components/ProcessingStatus.jsx
client/src/components/PdfViewer.jsx
client/src/components/Message.jsx
client/src/services/api.js
client/src/App.css
client/src/index.css

FRONTEND WORKSPACE

The interface contains:

- Dark sidebar
- DocuMind branding
- New document button
- Dashboard navigation
- Documents navigation
- Recent documents list
- Recent chats list
- Workspace header
- Upload dashboard
- Processing status card
- PDF preview
- Chat panel
- Markdown messages
- Animated loading state
- Responsive mobile layout

PDF VIEWER

The PDF viewer is implemented in:

client/src/components/PdfViewer.jsx

How it works:

1. User uploads a PDF.
2. Browser File object is passed to Home.jsx.
3. PdfViewer creates an object URL:
   URL.createObjectURL(file)
4. The object URL is loaded inside an iframe.
5. The user can open the PDF in a new tab.
6. The user can close the PDF preview.
7. The user can reopen the preview.
8. The URL is revoked when the file changes or the component is removed.

When the PDF is closed:

- PDF panel is hidden.
- Chat changes to one column.
- Chat expands to the available workspace width.

FRONTEND UPLOAD FLOW

UploadBox.jsx:

1. User selects or drops a PDF.
2. File is validated.
3. uploadPDF() sends multipart form data.
4. Backend returns documentId.
5. Home.jsx stores documentId and selected file.
6. useDocumentStatus() polls processing state.
7. ProcessingStatus.jsx displays progress.
8. After completed status, PDF viewer and ChatBox appear.

MARKDOWN FORMATTING

Chat answers are rendered through:

client/src/components/Message.jsx

Summaries are rendered through:

client/src/components/Summary.jsx

Both use:

react-markdown
remark-gfm

Supported formatting includes:

- Headings
- Paragraphs
- Bold text
- Lists
- Numbered lists
- Tables
- Blockquotes
- Markdown formatting

CURRENT PERFORMANCE OPTIMIZATIONS

The graph pipeline was optimized from:

One Gemini request per chunk

to:

One Gemini batch request per document

Neo4j writes are limited to batches of four concurrent writes to prevent:

Connection acquisition timed out

Document summary generation starts concurrently with graph extraction.

This reduces the time before the document becomes ready.

IMPORTANT CURRENT FILE STATE

The graph extractor exports:

extractGraphBatch()

The ingestion service imports:

extractGraphBatch()

The ingestion service also calls:

createDocumentGraph()

The hybrid retriever calls:

createEmbedding()
vectorSearch()
graphSearch()

Neo4j graph processing is required.

CURRENT KNOWN LIMITATIONS

1. Recent documents are stored only in frontend memory.
2. Recent documents disappear after page refresh.
3. Recent chats are stored in MongoDB.
4. Existing uploaded files cannot always be previewed after refresh because browser File objects are not preserved.
5. PDF preview currently uses an iframe.
6. Page citation clicking is not yet connected to PDF page navigation.
7. Layout analysis exists but is not connected to ingestion.
8. Reranking exists but is not connected to chat retrieval.
9. Chat conversation summarization exists but is not currently called by the controller.
10. Authentication is not implemented.
11. Rate limiting is not implemented.
12. File security validation is basic.
13. Very large PDFs may still take a long time.
14. Batch graph extraction can produce a large prompt for very large documents.
15. Neo4j must be running for document processing.
16. Qdrant must be running and accessible.
17. Gemini API key must be valid.

RUNNING THE PROJECT

Start Docker databases:

cd C:\Users\21230\DocuMind-AI
docker compose up -d

Check Docker:

docker ps

Start backend in terminal 1:

cd C:\Users\21230\DocuMind-AI\server
npm install
npm run dev

Backend URL:

http://localhost:5000

Health check:

http://localhost:5000/api/health

Start frontend in terminal 2:

cd C:\Users\21230\DocuMind-AI\client
npm install
npm run dev

Frontend URL:

http://localhost:5173

VALIDATION COMMANDS

Frontend lint:

cd C:\Users\21230\DocuMind-AI\client
npm run lint

Frontend build:

cd C:\Users\21230\DocuMind-AI\client
npm run build

Backend syntax checks:

cd C:\Users\21230\DocuMind-AI\server
node --check src/server.js
node --check src/services/document/ingestion.service.js
node --check src/services/graph/graph-extractor.js
node --check src/services/graph/neo4j.service.js
node --check src/services/retrieval/hybrid-retriever.js

Neo4j connection test:

cd C:\Users\21230\DocuMind-AI\server

node --input-type=module -e "import dotenv from 'dotenv'; dotenv.config(); const { default:driver}=await import('./src/config/neo4j.js'); await driver.verifyConnectivity(); console.log('Neo4j connected'); await driver.close()"

Qdrant connection test:

cd C:\Users\21230\DocuMind-AI\server

node --input-type=module -e "import dotenv from 'dotenv'; dotenv.config(); const { default:qdrant}=await import('./src/config/qdrant.js'); const result=await qdrant.getCollections(); console.log('Qdrant connected:',result.collections.length,'collections')"

MongoDB health is checked when starting the backend.

COMMON ERRORS

Error:
Cannot find package pdfjs-dist

Fix:
cd server
npm install pdfjs-dist

Error:
hybrid-retriever.js does not provide an export named hybridSearch

Fix:
Ensure hybrid-retriever.js exports hybridSearch.

Error:
summary.service.js does not provide an export named generateSummary

Fix:
Ensure summary.service.js exports generateSummary.

Error:
Value is none of these types String, Path

Cause:
PDF.js and canvas version mismatch.

Fix:
Use:

@napi-rs/canvas@0.1.100
pdfjs-dist@5.6.205

Error:
Qdrant Bad Request for point ID

Cause:
Qdrant does not accept normal chunk ID strings.

Fix:
Use deterministic UUID point IDs.

Error:
Qdrant index required for documentId

Fix:
Create a keyword payload index for documentId.

Error:
Qdrant connection timeout on port 6333

Cause:
Cloud Qdrant uses HTTPS port 443.

Fix:
Configure Qdrant client with:

port: 443
https: true

Error:
Neo4j unauthorized

Cause:
Wrong Neo4j credentials or Aura credentials used with Docker Neo4j.

Fix:
Use Docker values:

NEO4J_URI=neo4j://127.0.0.1:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password

Error:
Connection acquisition timed out

Cause:
Docker was paused or too many Neo4j sessions were opened concurrently.

Fix:
1. Unpause Docker Desktop.
2. Confirm Neo4j container is running.
3. Limit Neo4j writes to small batches.

Error:
Gemini 503 UNAVAILABLE

Cause:
Temporary Gemini model overload.

Fix:
Retry transient Gemini errors or try again later.

Error:
Frontend upload returns 404

Cause:
Upload route was missing or frontend used a wrong endpoint.

Correct endpoint:

POST /api/documents/upload

Error:
Chat returns 404

Cause:
Frontend used /api/chat/ask while backend uses:

POST /api/chat

SECURITY WARNING

Environment credentials and API keys were exposed during previous testing.

Before production deployment, rotate:

- MongoDB password
- Gemini API key
- Qdrant API key
- Neo4j password

Do not commit server/.env to Git.

COPY-PASTE PROMPT FOR A NEW CHAT

I am continuing work on the DocuMind-AI project.

Project location:
C:\Users\21230\DocuMind-AI

The project is a React and Node.js PDF analysis application using:

- React + Vite
- Node.js + Express
- MongoDB
- Gemini
- Qdrant
- Neo4j
- PDF.js
- Tesseract OCR

Main flow:

PDF upload
  ->
PDF text extraction
  ->
OCR fallback
  ->
Cleaning
  ->
Chunking
  ->
Gemini embeddings
  ->
Qdrant vectors
  ->
Batch Gemini graph extraction
  ->
Neo4j entities and relationships
  ->
Gemini summary
  ->
Chat with hybrid Qdrant and Neo4j retrieval
  ->
Gemini grounded answer
  ->
Markdown answer with citations

Current Docker Neo4j configuration:

NEO4J_URI=neo4j://127.0.0.1:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password

Docker Neo4j Browser:
http://localhost:7474

Backend:

cd C:\Users\21230\DocuMind-AI\server
npm run dev

Backend URL:
http://localhost:5000

Frontend:

cd C:\Users\21230\DocuMind-AI\client
npm run dev

Frontend URL:
http://localhost:5173

Important APIs:

POST /api/documents/upload
GET /api/documents/:documentId/status
POST /api/chat
GET /api/chat/recent
GET /api/chat/:chatId
GET /api/health

Important frontend features:

- Production-style dashboard
- Sidebar
- Recent documents
- Recent chats
- Drag-and-drop upload
- Processing progress
- PDF preview beside chat
- Close PDF preview
- Expand chat to full width
- Markdown summaries
- Markdown answers
- Responsive mobile layout

Important backend features:

- OCR fallback
- Gemini embeddings
- Gemini batch graph extraction
- Neo4j entity and relationship storage
- Qdrant vector search
- Hybrid retrieval
- Persistent recent chats
- Conversation history
- Gemini retry helper

Important recent optimization:

Graph extraction now uses one Gemini batch request per document instead of one request per chunk.

Neo4j writes run in small batches to avoid connection pool timeouts.

Current likely task:

Inspect the current files before editing because previous work may have changed the repository. Preserve the existing architecture and API contracts.





