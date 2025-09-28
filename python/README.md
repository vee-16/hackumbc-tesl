# 🎯 AI Support Ticket Assistant

A complete **FREE** solution for intelligent customer support ticket classification and assistance using **Next.js + TypeScript**, Supabase, Vercel, and Google Gemini AI.

## 🌟 Features

- **🎯 Smart ML Classification**: Fast keyword-based classifier (upgradeable to full ML models)
- **🤖 AI-Powered Assistance**: Google Gemini integration with specialized prompts for each ticket type
- **💻 Modern Web Interface**: Beautiful React components with Tailwind CSS and responsive design
- **🗄️ Database Integration**: Supabase for ticket storage, analytics, and real-time updates
- **🚀 Free Deployment**: Vercel hosting with zero cost and automatic scaling
- **🛡️ Reliable Fallback**: Works even when AI services are unavailable

## 🏗️ Architecture

```
User Input → ML Classifier → Specialized AI Assistant → Quality Response
     ↓              ↓                    ↓                      ↓
Always works → Smart routing → Targeted prompts → Better results
```

**Why This Architecture?**
- **Reliability**: System works even if AI fails
- **Performance**: <500ms classification + targeted AI
- **Quality**: Specialized prompts for each ticket type
- **Cost**: Efficient API usage with smart routing

## 📁 Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes (classification, assistance)
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Main page
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── TicketForm.tsx  # Ticket submission form
│   │   ├── TicketResults.tsx # Results display
│   │   └── ...             # Other UI components
│   ├── lib/                # Utilities and integrations
│   │   ├── classifier.ts   # ML classification logic
│   │   ├── gemini.ts       # Gemini AI integration
│   │   └── supabase.ts     # Database client
│   └── types/              # TypeScript type definitions
├── package.json            # Node.js dependencies
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS config
├── vercel.json             # Vercel deployment config
├── supabase_schema.sql     # Database schema
└── .env.example           # Environment variables template
```

## 🚀 Quick Start (100% Free Setup)

### 1. **Clone and Setup**
```bash
git clone <your-repo>
cd HackathonProject
pip install -r requirements.txt
```

### 2. **Get Free API Keys**

#### Supabase (Database)
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (free tier: 500MB database, 50MB file storage)
3. Go to Settings → API and copy:
   - Project URL
   - `anon` `public` key

#### Google Gemini AI
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a free API key (free tier: 60 requests per minute)

### 3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your API keys
```

### 4. **Setup Database**
1. In your Supabase dashboard, go to SQL Editor
2. Copy and run the contents of `supabase_schema.sql`

### 5. **Train Models (First Time)**
```bash
python ticket_classifier.py
```

### 6. **Run Locally**
```bash
python app.py
```
Visit `http://localhost:5000` to use the app!

### 7. **Deploy to Vercel (Free)**
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Add environment variables in Vercel dashboard
4. Your app is live! 🎉

## Expected Output

Both scripts will:
1. Load and preprocess ticket data
2. Train TF-IDF + Logistic Regression models for:
   - Ticket type classification (e.g., hardware, software, network)
   - Urgency level classification (e.g., low, medium, high)
3. Evaluate model performance
4. Save trained models to the `models/` directory
5. Demonstrate predictions on sample text

## Model Files

After running either script, you'll find these files in the `models/` directory:
- `tfidf_vectorizer.joblib` - Text vectorizer
- `type_clf_lr.joblib` - Ticket type classifier
- `urgency_clf_lr.joblib` - Urgency level classifier
- `type_label_encoder.joblib` - Type label encoder
- `urgency_label_encoder.joblib` - Urgency label encoder

## Making Predictions

After training, you can use the models to predict ticket classifications:

```python
import joblib

# Load models
tfidf = joblib.load("models/tfidf_vectorizer.joblib")
type_clf = joblib.load("models/type_clf_lr.joblib")
urgency_clf = joblib.load("models/urgency_clf_lr.joblib")
type_le = joblib.load("models/type_label_encoder.joblib")
urgency_le = joblib.load("models/urgency_label_encoder.joblib")

# Make prediction
def predict_ticket(text):
    vec = tfidf.transform([text])
    type_idx = type_clf.predict(vec)[0]
    urgency_idx = urgency_clf.predict(vec)[0]
    return {
        "type": type_le.inverse_transform([type_idx])[0],
        "urgency": urgency_le.inverse_transform([urgency_idx])[0]
    }

# Example
result = predict_ticket("My laptop won't start and I have an important presentation tomorrow")
print(f"Type: {result['type']}, Urgency: {result['urgency']}")
```

## Advanced Features

### Transformer Models
Both scripts include setup for fine-tuning DistilBERT models. To enable:
1. Uncomment the training sections in the scripts
2. Ensure you have sufficient computational resources (GPU recommended)

### API Deployment
`Filter.py` includes commented FastAPI code for serving models as a web API. To enable:
1. Uncomment the FastAPI section
2. Install FastAPI: `pip install fastapi uvicorn`
3. Run: `uvicorn Filter:app --reload --port 8000`

## Troubleshooting

1. **Missing dependencies**: Run `pip install -r requirements.txt`
2. **Kaggle authentication**: Set up Kaggle API credentials
3. **Data file not found**: Ensure CSV file is in the correct location
4. **Memory issues**: Reduce batch sizes or use CPU instead of GPU

## Data Format

The scripts expect CSV data with columns for:
- Text content (ticket description)
- Category/type (e.g., hardware, software, network)
- Urgency level (e.g., low, medium, high)

The scripts will automatically detect and adapt to different column naming conventions.
