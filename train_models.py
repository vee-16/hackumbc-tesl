#!/usr/bin/env python3
"""
Enhanced Model Training Script
Trains ML models using your real data and exports them for Next.js integration
"""

import os
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score
import joblib

# Configuration
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

def load_and_prepare_data():
    """Load and prepare your ticket data"""
    try:
        # Try to load the CSV file
        csv_path = "synthetic_ticket_data (1) - synthetic_ticket_data (1).csv"
        if os.path.exists(csv_path):
            df = pd.read_csv(csv_path)
            print(f"✅ Loaded data from: {csv_path}")
        else:
            print("❌ CSV file not found")
            return None
        
        print(f"📊 Dataset shape: {df.shape}")
        print(f"📋 Columns: {df.columns.tolist()}")
        
        # Combine title and body for text
        df['text'] = (df['title'].fillna('') + ' ' + df['body'].fillna('')).str.strip()
        
        # Clean and prepare data
        df = df.dropna(subset=['text', 'category', 'urgency']).reset_index(drop=True)
        df = df[df['text'].str.strip() != ''].reset_index(drop=True)
        
        # Standardize urgency levels
        urgency_mapping = {
            'Low': 'low',
            'Medium': 'medium', 
            'High': 'high',
            'Critical': 'high'  # Map critical to high for simplicity
        }
        df['urgency'] = df['urgency'].map(urgency_mapping).fillna('medium')
        
        # Standardize categories to match your system
        category_mapping = {
            'network': 'network',
            'hardware': 'hardware', 
            'software': 'software',
            'account': 'account'
        }
        df['category'] = df['category'].map(category_mapping).fillna('other')
        
        print(f"🧹 Cleaned dataset shape: {df.shape}")
        print(f"📊 Category distribution:\n{df['category'].value_counts()}")
        print(f"🚨 Urgency distribution:\n{df['urgency'].value_counts()}")
        
        return df
        
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return None

def train_models(df):
    """Train TF-IDF + Logistic Regression models"""
    
    # Encode labels
    type_le = LabelEncoder()
    urgency_le = LabelEncoder()
    
    df["type_label"] = type_le.fit_transform(df["category"])
    df["urgency_label"] = urgency_le.fit_transform(df["urgency"])
    
    print(f"🏷️ Type classes: {list(type_le.classes_)}")
    print(f"🚨 Urgency classes: {list(urgency_le.classes_)}")
    
    # Train/test split
    if len(df) >= 4:
        try:
            train_df, test_df = train_test_split(
                df, test_size=0.2, random_state=RANDOM_SEED, 
                stratify=df[["type_label", "urgency_label"]]
            )
        except ValueError:
            # Fallback if stratification fails
            train_df, test_df = train_test_split(df, test_size=0.2, random_state=RANDOM_SEED)
    else:
        train_df = test_df = df
    
    print(f"🚂 Training set size: {len(train_df)}")
    print(f"🧪 Test set size: {len(test_df)}")
    
    # TF-IDF Vectorization
    tfidf = TfidfVectorizer(
        max_features=10000,
        ngram_range=(1, 2),
        stop_words="english",
        min_df=2,
        max_df=0.95
    )
    
    X_train = tfidf.fit_transform(train_df["text"])
    X_test = tfidf.transform(test_df["text"])
    
    # Train Type Classifier
    type_clf = LogisticRegression(
        max_iter=2000, 
        class_weight="balanced", 
        random_state=RANDOM_SEED,
        C=1.0
    )
    type_clf.fit(X_train, train_df["type_label"])
    
    # Train Urgency Classifier  
    urgency_clf = LogisticRegression(
        max_iter=2000,
        class_weight="balanced", 
        random_state=RANDOM_SEED,
        C=1.0
    )
    urgency_clf.fit(X_train, train_df["urgency_label"])
    
    # Evaluate models
    if len(test_df) > 0:
        type_preds = type_clf.predict(X_test)
        urgency_preds = urgency_clf.predict(X_test)
        
        type_accuracy = accuracy_score(test_df["type_label"], type_preds)
        urgency_accuracy = accuracy_score(test_df["urgency_label"], urgency_preds)
        
        print(f"\n🎯 Type Classification Accuracy: {type_accuracy:.3f}")
        print("📊 Type Classification Report:")
        print(classification_report(test_df["type_label"], type_preds, target_names=type_le.classes_))
        
        print(f"\n🚨 Urgency Classification Accuracy: {urgency_accuracy:.3f}")
        print("📊 Urgency Classification Report:")
        print(classification_report(test_df["urgency_label"], urgency_preds, target_names=urgency_le.classes_))
    
    # Save models
    os.makedirs("models", exist_ok=True)
    
    joblib.dump(tfidf, "models/tfidf_vectorizer.joblib")
    joblib.dump(type_clf, "models/type_classifier.joblib")
    joblib.dump(urgency_clf, "models/urgency_classifier.joblib")
    joblib.dump(type_le, "models/type_label_encoder.joblib")
    joblib.dump(urgency_le, "models/urgency_label_encoder.joblib")
    
    # Export model metadata for Next.js
    metadata = {
        "model_type": "tfidf_logistic_regression",
        "type_classes": list(type_le.classes_),
        "urgency_classes": list(urgency_le.classes_),
        "training_samples": len(train_df),
        "test_samples": len(test_df),
        "type_accuracy": float(type_accuracy) if len(test_df) > 0 else 0.0,
        "urgency_accuracy": float(urgency_accuracy) if len(test_df) > 0 else 0.0,
        "features": tfidf.get_feature_names_out()[:100].tolist(),  # Top 100 features
        "trained_at": pd.Timestamp.now().isoformat()
    }
    
    with open("models/model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)
    
    print("\n✅ Models saved successfully!")
    print("📁 Saved files:")
    print("  - models/tfidf_vectorizer.joblib")
    print("  - models/type_classifier.joblib") 
    print("  - models/urgency_classifier.joblib")
    print("  - models/type_label_encoder.joblib")
    print("  - models/urgency_label_encoder.joblib")
    print("  - models/model_metadata.json")
    
    return metadata

def test_prediction(metadata):
    """Test the trained models with sample predictions"""
    try:
        # Load models
        tfidf = joblib.load("models/tfidf_vectorizer.joblib")
        type_clf = joblib.load("models/type_classifier.joblib")
        urgency_clf = joblib.load("models/urgency_classifier.joblib")
        type_le = joblib.load("models/type_label_encoder.joblib")
        urgency_le = joblib.load("models/urgency_label_encoder.joblib")
        
        # Test samples
        test_samples = [
            "My laptop won't start and the screen stays black",
            "Excel keeps crashing when I open large files",
            "I can't connect to the WiFi network",
            "I forgot my password and can't log in",
            "The printer is not responding to print jobs"
        ]
        
        print("\n🧪 Testing Predictions:")
        print("=" * 60)
        
        for text in test_samples:
            # Vectorize
            vec = tfidf.transform([text])
            
            # Predict
            type_idx = type_clf.predict(vec)[0]
            urgency_idx = urgency_clf.predict(vec)[0]
            
            # Get probabilities
            type_probs = type_clf.predict_proba(vec)[0]
            urgency_probs = urgency_clf.predict_proba(vec)[0]
            
            # Decode
            predicted_type = type_le.inverse_transform([type_idx])[0]
            predicted_urgency = urgency_le.inverse_transform([urgency_idx])[0]
            
            print(f"\n📝 Text: '{text[:50]}...'")
            print(f"🏷️ Type: {predicted_type} (confidence: {max(type_probs):.3f})")
            print(f"🚨 Urgency: {predicted_urgency} (confidence: {max(urgency_probs):.3f})")
            
    except Exception as e:
        print(f"❌ Error testing predictions: {e}")

if __name__ == "__main__":
    print("🚀 Starting Enhanced Model Training")
    print("=" * 50)
    
    # Load data
    df = load_and_prepare_data()
    if df is None:
        print("❌ Failed to load data. Exiting.")
        exit(1)
    
    # Train models
    metadata = train_models(df)
    
    # Test predictions
    test_prediction(metadata)
    
    print("\n🎉 Training Complete!")
    print("💡 Next steps:")
    print("  1. The models are ready for Next.js integration")
    print("  2. Run 'npm run dev' to test the enhanced classifier")
    print("  3. Your system now uses real ML models trained on your data!")
