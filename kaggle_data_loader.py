# requirements (pip):
# pip install kagglehub pandas scikit-learn joblib fastapi uvicorn transformers datasets torch sentence-transformers evaluate

import kagglehub
import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, f1_score
import joblib

# For transformer fine-tuning
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
import torch
from datasets import Dataset
import evaluate

# ------------- CONFIG -------------
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)
torch.manual_seed(RANDOM_SEED)

# ------------- DOWNLOAD DATA FROM KAGGLE -------------
print("Downloading dataset from Kaggle...")
try:
    # Download latest version
    path = kagglehub.dataset_download("suraj520/customer-support-ticket-dataset")
    print("Path to dataset files:", path)
    
    # List files in the downloaded directory
    dataset_files = os.listdir(path)
    print("Available files:", dataset_files)
    
    # Find CSV files in the dataset
    csv_files = [f for f in dataset_files if f.endswith('.csv')]
    if csv_files:
        print("CSV files found:", csv_files)
        # Use the first CSV file found
        csv_file = csv_files[0]
        dataset_path = os.path.join(path, csv_file)
        print(f"Using dataset file: {dataset_path}")
    else:
        print("No CSV files found in the dataset")
        dataset_path = None
        
except Exception as e:
    print(f"Error downloading dataset: {e}")
    dataset_path = None

# ------------- READ DATA -------------
if dataset_path and os.path.exists(dataset_path):
    try:
        # Load data from the downloaded CSV
        df = pd.read_csv(dataset_path)
        print(f"Dataset shape: {df.shape}")
        print("Dataset columns:", df.columns.tolist())
        print("\nFirst few rows:")
        print(df.head())
        
        # Inspect the data structure to understand column names
        print("\nDataset info:")
        print(df.info())
        
        # Check for common column names that might contain ticket text
        text_columns = []
        for col in df.columns:
            if any(keyword in col.lower() for keyword in ['text', 'description', 'message', 'content', 'body', 'title', 'subject']):
                text_columns.append(col)
        
        print(f"Potential text columns: {text_columns}")
        
        # Check for category/type columns
        category_columns = []
        for col in df.columns:
            if any(keyword in col.lower() for keyword in ['category', 'type', 'class', 'label', 'tag']):
                category_columns.append(col)
        
        print(f"Potential category columns: {category_columns}")
        
        # Check for urgency/priority columns
        urgency_columns = []
        for col in df.columns:
            if any(keyword in col.lower() for keyword in ['urgency', 'priority', 'severity', 'level']):
                urgency_columns.append(col)
        
        print(f"Potential urgency columns: {urgency_columns}")
        
        # Attempt to create a standardized format
        # This will need to be adjusted based on the actual dataset structure
        if text_columns:
            # Combine text columns if multiple exist
            if len(text_columns) > 1:
                df['text'] = df[text_columns].fillna('').apply(lambda x: ' '.join(x.astype(str)), axis=1)
            else:
                df['text'] = df[text_columns[0]].fillna('')
        else:
            print("Warning: No obvious text columns found. Please check the dataset structure.")
            df['text'] = ''
        
        # Handle category column
        if category_columns:
            df['category'] = df[category_columns[0]]
        else:
            print("Warning: No obvious category column found. Creating default categories.")
            df['category'] = 'general'
        
        # Handle urgency column
        if urgency_columns:
            df['urgency'] = df[urgency_columns[0]]
        else:
            print("Warning: No obvious urgency column found. Creating default urgency levels.")
            df['urgency'] = 'medium'
        
        # Clean the data
        df = df.dropna(subset=['text']).reset_index(drop=True)
        df = df[df['text'].str.strip() != ''].reset_index(drop=True)
        
        print(f"\nCleaned dataset shape: {df.shape}")
        print("Sample processed data:")
        print(df[['text', 'category', 'urgency']].head())
        
    except Exception as e:
        print(f"Error loading dataset: {e}")
        df = pd.DataFrame()
else:
    print("Dataset not available. Creating sample data for demonstration.")
    # Create sample data if dataset download fails
    data = {
        "text": [
            "Laptop won't boot, black screen, fans spin",
            "Cannot login to email, password not accepted",
            "VPN connection drops intermittently",
            "Application crashes on save with stacktrace error",
            "Mouse not recognized after Windows update",
            "Request to install Photoshop for designer",
            "Disk health warning, SMART reported failing sectors",
            "Slow internet speed on floor 3"
        ],
        "category": ["hardware", "account", "network", "software", "hardware", "software", "hardware", "network"],
        "urgency": ["high", "high", "medium", "high", "medium", "low", "high", "medium"]
    }
    df = pd.DataFrame(data)

# ------------- PROCESS DATA -------------
if not df.empty:
    # Basic cleaning
    df["text"] = df["text"].astype(str)
    
    # Encode labels
    type_le = LabelEncoder()
    urgency_le = LabelEncoder()
    df["type_label"] = type_le.fit_transform(df["category"])
    df["urgency_label"] = urgency_le.fit_transform(df["urgency"])
    
    print("Type classes:", list(type_le.classes_))
    print("Urgency classes:", list(urgency_le.classes_))
    
    # Train/test split with proper stratification handling
    if len(df) < 2:
        print("Warning: Not enough data for train/test split.")
        train_df = df.copy()
        test_df = df.copy()
    else:
        # Check if there are enough samples for stratification
        if df['type_label'].nunique() > 1 and df['urgency_label'].nunique() > 1 and len(df) >= 4:
            try:
                train_df, test_df = train_test_split(
                    df, test_size=0.2, random_state=RANDOM_SEED, 
                    stratify=df[["type_label", "urgency_label"]]
                )
            except ValueError:
                # Fallback to simple stratification
                train_df, test_df = train_test_split(
                    df, test_size=0.2, random_state=RANDOM_SEED, 
                    stratify=df["type_label"]
                )
        elif df['type_label'].nunique() > 1 and len(df) >= 4:
            train_df, test_df = train_test_split(
                df, test_size=0.2, random_state=RANDOM_SEED, 
                stratify=df["type_label"]
            )
        else:
            # Simple split if stratification is not possible
            print("Warning: Using simple train/test split due to insufficient data diversity.")
            train_df, test_df = train_test_split(df, test_size=0.2, random_state=RANDOM_SEED)
    
    print(f"Training set size: {len(train_df)}")
    print(f"Test set size: {len(test_df)}")
    
    # =====================================
    # Baseline: TF-IDF + Logistic Regression
    # =====================================
    if len(train_df) > 0:
        tfidf = TfidfVectorizer(max_features=20000, ngram_range=(1,2), stop_words="english")
        X_train = tfidf.fit_transform(train_df["text"])
        X_test = tfidf.transform(test_df["text"])
        
        # Train models
        type_clf = LogisticRegression(max_iter=2000, class_weight="balanced", random_state=RANDOM_SEED)
        type_clf.fit(X_train, train_df["type_label"])
        
        urgency_clf = LogisticRegression(max_iter=2000, class_weight="balanced", random_state=RANDOM_SEED)
        urgency_clf.fit(X_train, train_df["urgency_label"])
        
        # Evaluate
        if len(test_df) > 0:
            type_preds = type_clf.predict(X_test)
            urgency_preds = urgency_clf.predict(X_test)
            
            print("\nBaseline (TF-IDF + LR) - Ticket Type")
            print(classification_report(test_df["type_label"], type_preds, target_names=type_le.classes_))
            
            print("\nBaseline (TF-IDF + LR) - Urgency")
            print(classification_report(test_df["urgency_label"], urgency_preds, target_names=urgency_le.classes_))
        
        # Save models
        os.makedirs("models", exist_ok=True)
        joblib.dump(tfidf, "models/tfidf_vectorizer.joblib")
        joblib.dump(type_clf, "models/type_clf_lr.joblib")
        joblib.dump(urgency_clf, "models/urgency_clf_lr.joblib")
        joblib.dump(type_le, "models/type_label_encoder.joblib")
        joblib.dump(urgency_le, "models/urgency_label_encoder.joblib")
        
        print("\nModels saved successfully!")
        
        # Inference function
        def predict_ticket_baseline(text):
            vec = tfidf.transform([text])
            type_idx = type_clf.predict(vec)[0]
            urgency_idx = urgency_clf.predict(vec)[0]
            return {
                "type": type_le.inverse_transform([type_idx])[0],
                "urgency": urgency_le.inverse_transform([urgency_idx])[0]
            }
        
        # Test the prediction function
        sample_text = "My computer is running very slowly and applications keep crashing"
        prediction = predict_ticket_baseline(sample_text)
        print(f"\nSample prediction for: '{sample_text}'")
        print(f"Predicted type: {prediction['type']}")
        print(f"Predicted urgency: {prediction['urgency']}")
        
    else:
        print("No training data available.")
        
else:
    print("No data available for processing.")
