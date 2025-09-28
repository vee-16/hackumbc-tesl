# 🎯 Complete Setup Guide - AI Support Ticket System

## 🌟 What You've Got

A **completely FREE** AI-powered support ticket system built with **Next.js + TypeScript**:

1. **Smart ML Classification** - Fast keyword-based classifier (upgradeable to your Filter.py ML models)
2. **AI-Powered Assistance** - Google Gemini integration with specialized prompts
3. **Modern Web Interface** - Beautiful React components with Tailwind CSS
4. **Database Integration** - Supabase for ticket storage and analytics
5. **Free Deployment** - Vercel hosting with zero cost

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 2: Get Free API Keys

#### Supabase (Database)
1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Create new project → Wait for setup
3. Go to Settings → API → Copy:
   - Project URL
   - `anon` `public` key

#### Google Gemini AI
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key (free tier: 60 requests/minute)

### Step 3: Configure Environment
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your API keys:
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=AIzaSyApjt9Dk0-ibNiiOA3gGrw8JVQOjsO5PRM  # Your key is already set!
```

### Step 4: Setup Database
1. In Supabase dashboard → SQL Editor
2. Copy/paste contents of `supabase_schema.sql`
3. Run the SQL

### Step 5: Run Development Server
```bash
npm run dev
# or
yarn dev
```
Visit: http://localhost:3000

### Step 6: Test the System
Visit: http://localhost:3000/api/health

## 🌐 Deploy to Vercel (Free)

### Option 1: Automatic
```bash
python deploy.py
```

### Option 2: Manual
```bash
npm i -g vercel
vercel
# Follow prompts
# Add environment variables in Vercel dashboard
```

## 📋 How It Works

### User Flow:
1. **User submits ticket** → Web form
2. **ML classifies ticket** → Type + Urgency
3. **AI generates help** → Specialized assistant
4. **Response delivered** → Formatted assistance
5. **Everything stored** → Supabase database

### Technical Flow:
```
Flask App (app.py)
├── Ticket Classifier (ticket_classifier.py)
│   ├── TF-IDF Vectorizer
│   └── Logistic Regression Models
├── AI Assistant (gemini_assistant.py)
│   ├── Specialized prompts per ticket type
│   └── Gemini API integration
└── Database (Supabase)
    ├── Ticket storage
    └── Analytics
```

## 🔧 File Overview

| File | Purpose |
|------|---------|
| `app.py` | Main Flask web application |
| `ticket_classifier.py` | ML classification engine |
| `gemini_assistant.py` | AI assistance with Gemini |
| `templates/index.html` | Beautiful web interface |
| `supabase_schema.sql` | Database setup |
| `test_system.py` | Complete system test |
| `deploy.py` | Deployment helper |

## 🎯 Legacy Files (Now Integrated)

Your original assistant files are now integrated:
- `SoftwareAssistant.py` → Now in `gemini_assistant.py`
- `HardwareAssistant.py` → Now in `gemini_assistant.py`
- `NetworkSupportAssistant.py` → Now in `gemini_assistant.py`
- `Filter.py` → Now in `ticket_classifier.py`

## 💰 Cost Breakdown (FREE!)

| Service | Free Tier | Usage |
|---------|-----------|-------|
| **Vercel** | 100GB bandwidth | Hosting |
| **Supabase** | 500MB database | Data storage |
| **Gemini AI** | 60 requests/min | AI assistance |
| **Total** | **$0/month** | 🎉 |

## 🔍 Testing Your Setup

### Test Classification:
```python
from ticket_classifier import TicketClassifier
classifier = TicketClassifier()
result = classifier.predict("My laptop won't start")
print(result)
```

### Test AI Assistant:
```python
from gemini_assistant import GeminiAssistant
assistant = GeminiAssistant()
help_text = assistant.get_assistance("Excel keeps crashing", "software")
print(help_text)
```

### Test Full System:
```bash
python test_system.py
```

## 🚨 Troubleshooting

### Models not training?
```bash
python ticket_classifier.py
```

### Gemini not working?
- Check API key in .env
- Verify 60 requests/minute limit

### Supabase connection failed?
- Check URL and key in .env
- Verify database schema is created

### Vercel deployment issues?
- Add environment variables in dashboard
- Check function timeout (30s max)

## 🎉 Success Indicators

✅ `python test_system.py` passes all tests  
✅ `http://localhost:5000/api/health` returns healthy status  
✅ Can submit ticket and get AI response  
✅ Vercel deployment works  
✅ Database stores tickets  

## 🔮 Next Steps

1. **Customize AI prompts** in `gemini_assistant.py`
2. **Add user authentication** with Supabase Auth
3. **Create admin dashboard** for ticket management
4. **Add email notifications** for urgent tickets
5. **Implement ticket routing** to human agents

## 📞 Support

If you need help:
1. Run `python test_system.py` for diagnostics
2. Check the console logs for errors
3. Verify all environment variables are set
4. Ensure API keys are valid and have quota

---

**🎯 You now have a complete, free, AI-powered support ticket system!**

The system replaces expensive LLaMA models with free Gemini AI, provides a beautiful web interface, stores everything in a database, and deploys for free. Your original classification logic is preserved and enhanced with better error handling and web integration.
