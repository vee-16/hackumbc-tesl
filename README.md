# CivicLab Tech

A **centralized, AI-powered and human support IT helpdesk platform** that enables a multitude of customers to submit support tickets and staff to manage them with intelligent classification and auto-assignment.

## Features

### Customer Portal
- Secure Google login via NextAuth
- Submit support tickets with rich details
- View, track, and delete your own tickets

### Staff Portal
- Staff login (credentials or session)
- View assigned and unassigned tickets
- Claim tickets and update status (`to_do`, `in_progress`, `completed`)

### AI-Powered Classification
- Python microservice (Flask) using **Google Gemini** (with fallback heuristics)
- Predicts **priority** (`low`, `medium`, `high`) and **department** (`account`, `network`, `hardware`, `software`, `other`)
- Provides time estimates per ticket

### Auto Assignment
- Tickets are assigned to staff in the same department with the **least current workload**

### Database
- Supabase PostgreSQL with real-time updates
- Tables: `app_user`, `staff`, `ticket`

### Deployment
- Next.js app → Vercel
- Python classifier → Render (Flask API)

## Setup

### 1. Clone Repository

```bash
git clone https://github.com/<your-org>/civiclab.git
cd civiclab
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create `.env.local` for the **Next.js app**:

```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
CLASSIFIER_URL=https://<your-classifier-service>.onrender.com
CLASSIFIER_KEY=prod-secret
```

Create `.env` for the **Python classifier**:

```env
GEMINI_API_KEY=your_google_genai_key
CLASSIFIER_KEY=prod-secret
```

## Running Locally

Start both services together:

```bash
npm run dev
```

Defined in `package.json`:

```json
{
  "scripts": {
    "build": "next build --turbopack",
    "start": "next start",
    "py:dev": "cd python && python app.py",
    "dev": "concurrently -n PY,WEB -c yellow,cyan \"npm:py:dev\" \"next dev\""
  }
}
```

## Classifier Options

### 1. Vanilla Classifier (production-ready)
**Repo:** [vanilla-nlp-classifier](https://github.com/vee-16/nlp-service)

- Lightweight Flask service with fallback heuristics
- Ideal for deploying on **Render** as `Web Service`

### 2. Full-Fledged Classifier (development branch)
**Repo branch:** [advanced-classifier](https://github.com/vee-16/hackumbc-tesl/commit/7ea7450d264865d28320c0967b7e536f5403fed7)

#### Transformer Models
Both scripts include setup for fine-tuning DistilBERT models. To enable:
1. Uncomment the training sections in the scripts
2. Ensure you have sufficient computational resources (GPU recommended)

#### API Deployment
`Filter.py` includes commented FastAPI code for serving models as a web API. To enable:
1. Uncomment the FastAPI section
2. Install FastAPI: `pip install fastapi uvicorn`
3. Run: `uvicorn Filter:app --reload --port 8000`

## Deployment

### Frontend / Next.js → Vercel
Deploy the main application to Vercel with automatic builds from your repository.

### Python Classifier → Render
Deploy `python/` folder as a **Web Service**

**Configuration:**
- Start command: `python app.py`
- Expose port `8001`
- Ensure `CLASSIFIER_KEY` and `GEMINI_API_KEY` are set in environment variables

## API Endpoints

### Next.js (Vercel)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tickets` | Create ticket (auto-classified + assigned) |
| `GET` | `/api/tickets` | List tickets (customer-only) |
| `GET` | `/api/staff/tickets` | List tickets assigned to staff |
| `GET` | `/api/staff/unassigned` | List unclaimed tickets |

### Python Classifier (Render)

#### Health Check
```http
GET /health
```
Returns service status

#### Classify Ticket
```http
POST /classify
```

**Request Body:**
```json
{
  "title": "My computer won't boot",
  "message": "No lights or sounds, power button not working"
}
```

**Response:**
```json
{
  "priority": "high",
  "department": "hardware",
  "estimated_minutes": 180
}
```

## Team Contributions

- **Bookashee Diba**
- **Soham Harkare**
- **Kenean**
- **Vaishnavi Sinha**

## Support

For questions or issues, please contact the development team or create an issue in the repository.
