#!/usr/bin/env python3
"""
Ticket Classification Module
Integrates the existing Filter.py logic into a reusable class
"""

import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

class TicketClassifier:
    def __init__(self, models_dir="models"):
        """Initialize the ticket classifier"""
        self.models_dir = models_dir
        self.tfidf = None
        self.type_clf = None
        self.urgency_clf = None
        self.type_le = None
        self.urgency_le = None
        self.random_seed = 42
        
        # Try to load existing models
        self._load_models()
    
    def _load_models(self):
        """Load pre-trained models if they exist"""
        try:
            if os.path.exists(self.models_dir):
                self.tfidf = joblib.load(f"{self.models_dir}/tfidf_vectorizer.joblib")
                self.type_clf = joblib.load(f"{self.models_dir}/type_clf_lr.joblib")
                self.urgency_clf = joblib.load(f"{self.models_dir}/urgency_clf_lr.joblib")
                self.type_le = joblib.load(f"{self.models_dir}/type_label_encoder.joblib")
                self.urgency_le = joblib.load(f"{self.models_dir}/urgency_label_encoder.joblib")
                print("✅ Pre-trained models loaded successfully")
                return True
        except Exception as e:
            print(f"⚠️ Could not load pre-trained models: {e}")
            return False
        
        return False
    
    def _save_models(self):
        """Save trained models"""
        try:
            os.makedirs(self.models_dir, exist_ok=True)
            joblib.dump(self.tfidf, f"{self.models_dir}/tfidf_vectorizer.joblib")
            joblib.dump(self.type_clf, f"{self.models_dir}/type_clf_lr.joblib")
            joblib.dump(self.urgency_clf, f"{self.models_dir}/urgency_clf_lr.joblib")
            joblib.dump(self.type_le, f"{self.models_dir}/type_label_encoder.joblib")
            joblib.dump(self.urgency_le, f"{self.models_dir}/urgency_label_encoder.joblib")
            print("✅ Models saved successfully")
            return True
        except Exception as e:
            print(f"❌ Error saving models: {e}")
            return False
    
    def _get_sample_data(self):
        """Get sample training data if no real data is available"""
        data = {
            "text": [
                "Laptop won't boot, black screen, fans spin",
                "Cannot login to email, password not accepted",
                "VPN connection drops intermittently",
                "Application crashes on save with stacktrace error",
                "Mouse not recognized after Windows update",
                "Request to install Photoshop for designer",
                "Disk health warning, SMART reported failing sectors",
                "Slow internet speed on floor 3",
                "Printer not responding to print jobs",
                "Database connection timeout errors",
                "WiFi keeps disconnecting from network",
                "Software license expired notification",
                "Hard drive making clicking noises",
                "Cannot access shared network drive",
                "Application freezes when opening large files",
                "Monitor display flickering intermittently",
                "Email server not responding",
                "Router needs firmware update",
                "Software installation failed with error code",
                "Keyboard keys not responding properly"
            ],
            "category": [
                "hardware", "account", "network", "software", "hardware", 
                "software", "hardware", "network", "hardware", "software",
                "network", "software", "hardware", "network", "software",
                "hardware", "network", "network", "software", "hardware"
            ],
            "urgency": [
                "high", "high", "medium", "high", "medium", 
                "low", "high", "medium", "medium", "high",
                "medium", "low", "high", "medium", "medium",
                "medium", "high", "low", "medium", "low"
            ]
        }
        return pd.DataFrame(data)
    
    def _load_training_data(self):
        """Load training data from various sources"""
        df = None
        
        # Try to load from Downloads folder first
        downloads_path = r"c:\Users\Bruh 8.0 (new)\Downloads\synthetic_ticket_data (1) - synthetic_ticket_data (1).csv"
        if os.path.exists(downloads_path):
            try:
                df = pd.read_csv(downloads_path)
                print(f"✅ Loaded data from Downloads folder")
            except Exception as e:
                print(f"⚠️ Error loading from Downloads: {e}")
        
        # Try local file
        if df is None and os.path.exists("synthetic_ticket_data.csv"):
            try:
                df = pd.read_csv("synthetic_ticket_data.csv")
                print("✅ Loaded data from local file")
            except Exception as e:
                print(f"⚠️ Error loading local file: {e}")
        
        # Use sample data as fallback
        if df is None:
            print("📝 Using sample data for training")
            df = self._get_sample_data()
        
        return df
    
    def _preprocess_data(self, df):
        """Preprocess the training data"""
        # Handle different column naming conventions
        if 'title' in df.columns and 'body' in df.columns:
            df['text'] = df['title'].fillna('') + ' ' + df['body'].fillna('')
        elif 'description' in df.columns:
            df['text'] = df['description'].fillna('')
        elif 'text' not in df.columns:
            # Find text-like columns
            text_cols = [col for col in df.columns if any(keyword in col.lower() 
                        for keyword in ['text', 'description', 'message', 'content'])]
            if text_cols:
                df['text'] = df[text_cols[0]].fillna('')
            else:
                raise ValueError("No suitable text column found")
        
        # Clean data
        df = df.dropna(subset=['text', 'category', 'urgency']).reset_index(drop=True)
        df = df[df['text'].str.strip() != ''].reset_index(drop=True)
        df["text"] = df["text"].astype(str)
        
        return df
    
    def train(self):
        """Train the classification models"""
        print("🔄 Starting model training...")
        
        # Load and preprocess data
        df = self._load_training_data()
        df = self._preprocess_data(df)
        
        print(f"📊 Training data shape: {df.shape}")
        
        # Encode labels
        self.type_le = LabelEncoder()
        self.urgency_le = LabelEncoder()
        df["type_label"] = self.type_le.fit_transform(df["category"])
        df["urgency_label"] = self.urgency_le.fit_transform(df["urgency"])
        
        print("🏷️ Type classes:", list(self.type_le.classes_))
        print("🏷️ Urgency classes:", list(self.urgency_le.classes_))
        
        # Train/test split
        if len(df) < 2:
            train_df = test_df = df.copy()
        else:
            try:
                if (df['type_label'].nunique() > 1 and df['urgency_label'].nunique() > 1 
                    and len(df) >= 4):
                    train_df, test_df = train_test_split(
                        df, test_size=0.2, random_state=self.random_seed,
                        stratify=df[["type_label", "urgency_label"]]
                    )
                else:
                    train_df, test_df = train_test_split(
                        df, test_size=0.2, random_state=self.random_seed
                    )
            except ValueError:
                train_df, test_df = train_test_split(
                    df, test_size=0.2, random_state=self.random_seed
                )
        
        # Train TF-IDF vectorizer
        self.tfidf = TfidfVectorizer(
            max_features=20000, 
            ngram_range=(1,2), 
            stop_words="english"
        )
        X_train = self.tfidf.fit_transform(train_df["text"])
        X_test = self.tfidf.transform(test_df["text"])
        
        # Train classifiers
        self.type_clf = LogisticRegression(
            max_iter=2000, 
            class_weight="balanced", 
            random_state=self.random_seed
        )
        self.type_clf.fit(X_train, train_df["type_label"])
        
        self.urgency_clf = LogisticRegression(
            max_iter=2000, 
            class_weight="balanced", 
            random_state=self.random_seed
        )
        self.urgency_clf.fit(X_train, train_df["urgency_label"])
        
        # Evaluate if we have test data
        if len(test_df) > 0:
            type_preds = self.type_clf.predict(X_test)
            urgency_preds = self.urgency_clf.predict(X_test)
            
            print("\n📈 Type Classification Report:")
            print(classification_report(test_df["type_label"], type_preds, 
                                      target_names=self.type_le.classes_))
            
            print("\n📈 Urgency Classification Report:")
            print(classification_report(test_df["urgency_label"], urgency_preds, 
                                      target_names=self.urgency_le.classes_))
        
        # Save models
        self._save_models()
        print("✅ Training completed successfully!")
        
        return True
    
    def predict(self, text):
        """Predict ticket type and urgency"""
        if not self.is_ready():
            raise ValueError("Models not trained. Call train() first.")
        
        # Vectorize text
        vec = self.tfidf.transform([text])
        
        # Get predictions
        type_proba = self.type_clf.predict_proba(vec)[0]
        urgency_proba = self.urgency_clf.predict_proba(vec)[0]
        
        type_idx = self.type_clf.predict(vec)[0]
        urgency_idx = self.urgency_clf.predict(vec)[0]
        
        # Get confidence scores
        type_confidence = float(np.max(type_proba))
        urgency_confidence = float(np.max(urgency_proba))
        
        return {
            "type": self.type_le.inverse_transform([type_idx])[0],
            "urgency": self.urgency_le.inverse_transform([urgency_idx])[0],
            "confidence_type": type_confidence,
            "confidence_urgency": urgency_confidence,
            "type_probabilities": {
                class_name: float(prob) 
                for class_name, prob in zip(self.type_le.classes_, type_proba)
            },
            "urgency_probabilities": {
                class_name: float(prob) 
                for class_name, prob in zip(self.urgency_le.classes_, urgency_proba)
            }
        }
    
    def is_ready(self):
        """Check if the classifier is ready to make predictions"""
        return all([
            self.tfidf is not None,
            self.type_clf is not None,
            self.urgency_clf is not None,
            self.type_le is not None,
            self.urgency_le is not None
        ])

# Test the classifier if run directly
if __name__ == "__main__":
    classifier = TicketClassifier()
    
    if not classifier.is_ready():
        print("Training models...")
        classifier.train()
    
    # Test prediction
    test_text = "My computer is running very slowly and applications keep crashing"
    result = classifier.predict(test_text)
    
    print(f"\nTest prediction for: '{test_text}'")
    print(f"Type: {result['type']} (confidence: {result['confidence_type']:.2f})")
    print(f"Urgency: {result['urgency']} (confidence: {result['confidence_urgency']:.2f})")
