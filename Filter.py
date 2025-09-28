# requirements (pip):
# pip install pandas scikit-learn joblib fastapi uvicorn transformers datasets torch sentence-transformers evaluate
#FIGURE OUT HUGGINGFACE SITUATION
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
import evaluate # Import evaluate for loading metrics

# ------------- CONFIG -------------
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)
torch.manual_seed(RANDOM_SEED)

# labels you expect (example)
# TICKET_TYPES = ["technical", "software", "account", "network", "hardware", "other"]
# URGENCY_LEVELS = ["low", "medium", "high"]

# ------------- READ DATA -------------
# === READ DATA HERE ===
# Replace this block with actual loading from CSV, DB, or API.
# Examples:
#   - CSV: df = pd.read_csv("tickets.csv")
#   - Database: df = pd.read_sql("SELECT id, text, type, urgency FROM tickets", con=engine)
#   - API: r = requests.get(...); df = pd.DataFrame(r.json())
#
# The dataframe must contain at least:
#   - a text column with the ticket description (e.g. "text" or "description")
#   - a `type` column with the ticket category (or similar)
#   - an `urgency` column (e.g., low/medium/high)
#
# Example synthetic data if no real data provided:
# if True:
#     # remove this block when you load real data
#     data = {
#         "id": range(1, 9),
#         "text": [
#             "Laptop won't boot, black screen, fans spin",
#             "Cannot login to email, password not accepted",
#             "VPN connection drops intermittently",
#             "Application crashes on save with stacktrace error",
#             "Mouse not recognized after Windows update",
#             "Request to install Photoshop for designer",
#             "Disk health warning, SMART reported failing sectors",
#             "Slow internet speed on floor 3"
#         ],
#         "type": ["hardware", "account", "network", "software", "hardware", "software", "hardware", "network"],
#         "urgency": ["high", "high", "medium", "high", "medium", "low", "high", "medium"]
#     }
#     df = pd.DataFrame(data)
# === END READ DATA ===

# Load data from CSV
try:
    # Try to load the CSV file from the Downloads folder first
    downloads_path = r"c:\Users\Bruh 8.0 (new)\Downloads\synthetic_ticket_data (1) - synthetic_ticket_data (1).csv"
    if os.path.exists(downloads_path):
        df = pd.read_csv(downloads_path)
        print(f"Loaded data from Downloads folder: {downloads_path}")
    else:
        # Fallback to local file
        df = pd.read_csv("synthetic_ticket_data.csv")
        print("Loaded data from local file: synthetic_ticket_data.csv")

    print(f"Dataset shape: {df.shape}")
    print("Dataset columns:", df.columns.tolist())

    # Check if required columns exist and create text column appropriately
    if 'title' in df.columns and 'body' in df.columns:
        # Combine title and body for the text column
        df['text'] = df['title'].fillna('') + ' ' + df['body'].fillna('')
    elif 'description' in df.columns:
        df['text'] = df['description'].fillna('')
    elif 'text' in df.columns:
        df['text'] = df['text'].fillna('')
    else:
        # Use the first text-like column found
        text_cols = [col for col in df.columns if any(keyword in col.lower() for keyword in ['text', 'description', 'message', 'content'])]
        if text_cols:
            df['text'] = df[text_cols[0]].fillna('')
        else:
            raise ValueError("No suitable text column found in the dataset")

    # Ensure 'category' and 'urgency' columns exist and handle potential NaNs
    df = df.dropna(subset=['text', 'category', 'urgency']).reset_index(drop=True)

    # Remove empty text entries
    df = df[df['text'].str.strip() != ''].reset_index(drop=True)

except FileNotFoundError:
    print("Error: synthetic_ticket_data.csv not found in current directory or Downloads folder.")
    print("Please ensure the file is available.")
    # Create sample data for demonstration
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
    print("Using sample data for demonstration.")
except Exception as e:
    print(f"Error loading data: {e}")
    df = pd.DataFrame()


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

    # Train/test split
    # Check if there are enough samples for stratification
    if len(df) < 2:
        print("Warning: Not enough data for train/test split. Using all data for both training and testing.")
        train_df = df.copy()
        test_df = df.copy()
    else:
        try:
            if df['type_label'].nunique() > 1 and df['urgency_label'].nunique() > 1 and len(df) >= 4:
                train_df, test_df = train_test_split(df, test_size=0.2, random_state=RANDOM_SEED, stratify=df[["type_label", "urgency_label"]])
            elif df['type_label'].nunique() > 1 and len(df) >= 4:
                train_df, test_df = train_test_split(df, test_size=0.2, random_state=RANDOM_SEED, stratify=df["type_label"])
            elif df['urgency_label'].nunique() > 1 and len(df) >= 4:
                train_df, test_df = train_test_split(df, test_size=0.2, random_state=RANDOM_SEED, stratify=df["urgency_label"])
            else:
                # If not enough unique labels for stratification, do a simple split
                print("Warning: Not enough unique labels for stratification. Performing simple train/test split.")
                train_df, test_df = train_test_split(df, test_size=0.2, random_state=RANDOM_SEED)
        except ValueError as e:
            print(f"Warning: Stratification failed ({e}). Using simple train/test split.")
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

        # We train two separate models: one for type, one for urgency
        # Use class_weight="balanced" to handle imbalanced classes
        type_clf = LogisticRegression(max_iter=2000, class_weight="balanced", random_state=RANDOM_SEED)
        type_clf.fit(X_train, train_df["type_label"])

        urgency_clf = LogisticRegression(max_iter=2000, class_weight="balanced", random_state=RANDOM_SEED)
        urgency_clf.fit(X_train, train_df["urgency_label"])

        # Evaluate baseline
        if len(test_df) > 0:
            type_preds = type_clf.predict(X_test)
            urgency_preds = urgency_clf.predict(X_test)

            print("Baseline (TF-IDF + LR) - Ticket Type")
            print(classification_report(test_df["type_label"], type_preds, target_names=type_le.classes_))

            print("Baseline (TF-IDF + LR) - Urgency")
            print(classification_report(test_df["urgency_label"], urgency_preds, target_names=urgency_le.classes_))

        # Save baseline artifacts
        os.makedirs("models", exist_ok=True)
        joblib.dump(tfidf, "models/tfidf_vectorizer.joblib")
        joblib.dump(type_clf, "models/type_clf_lr.joblib")
        joblib.dump(urgency_clf, "models/urgency_clf_lr.joblib")
        joblib.dump(type_le, "models/type_label_encoder.joblib")
        joblib.dump(urgency_le, "models/urgency_label_encoder.joblib")

        print("Models saved successfully!")
    else:
        print("No training data available. Skipping model training.")

    # ================================
    # Stronger option: Transformers (DistilBERT)
    # ================================
    # This fine-tunes one model for each task. For production, you can:
    #  - share encoder and have two heads (multi-task) OR
    #  - fine-tune separate models (simpler). Here I show separate models for clarity.

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print("Using device:", device)

    def prepare_hf_dataset(df, text_col="text", label_col="type_label"):
        ds = Dataset.from_pandas(df[[text_col, label_col]].rename(columns={text_col: "text", label_col: "label"}))
        return ds

    model_name = "distilbert-base-uncased"
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    def tokenize_fn(examples):
        return tokenizer(examples["text"], truncation=True, padding="max_length", max_length=256)

    # ---- Type model ----
    type_ds_train = prepare_hf_dataset(train_df, "text", "type_label")
    type_ds_test = prepare_hf_dataset(test_df, "text", "type_label")
    type_ds_train = type_ds_train.map(tokenize_fn, batched=True)
    type_ds_test = type_ds_test.map(tokenize_fn, batched=True)
    type_ds_train = type_ds_train.remove_columns(["text"]).with_format("torch")
    type_ds_test = type_ds_test.remove_columns(["text"]).with_format("torch")

    num_type_labels = len(type_le.classes_)
    type_model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=num_type_labels).to(device)

    # Metrics for trainer
    metric = evaluate.load("f1")

    def compute_metrics(eval_pred):
        logits, labels = eval_pred
        preds = np.argmax(logits, axis=-1)
        f1 = f1_score(labels, preds, average="weighted")
        return {"weighted_f1": f1}

    training_args = TrainingArguments(
        output_dir="hf_type_model",
        per_device_train_batch_size=8,
        per_device_eval_batch_size=16,
        evaluation_strategy="epoch",
        num_train_epochs=2,
        save_total_limit=1,
        learning_rate=2e-5,
        seed=RANDOM_SEED,
        logging_steps=10,
        remove_unused_columns=False,
    )

    trainer = Trainer(
        model=type_model,
        args=training_args,
        train_dataset=type_ds_train,
        eval_dataset=type_ds_test,
        tokenizer=tokenizer,
        compute_metrics=compute_metrics
    )

    # Fine-tune (uncomment to run)
    # trainer.train()
    # trainer.save_model("models/hf_type_model")
    # tokenizer.save_pretrained("models/hf_type_model")

    # ---- Urgency model (same pattern) ----
    urgency_ds_train = prepare_hf_dataset(train_df, "text", "urgency_label")
    urgency_ds_test = prepare_hf_dataset(test_df, "text", "urgency_label")
    urgency_ds_train = urgency_ds_train.map(tokenize_fn, batched=True)
    urgency_ds_test = urgency_ds_test.map(tokenize_fn, batched=True)
    urgency_ds_train = urgency_ds_train.remove_columns(["text"]).with_format("torch")
    urgency_ds_test = urgency_ds_test.remove_columns(["text"]).with_format("torch")

    num_urgency_labels = len(urgency_le.classes_)
    urgency_model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=num_urgency_labels).to(device)

    training_args_urgency = TrainingArguments(
        output_dir="hf_urgency_model",
        per_device_train_batch_size=8,
        per_device_eval_batch_size=16,
        evaluation_strategy="epoch",
        num_train_epochs=2,
        save_total_limit=1,
        learning_rate=2e-5,
        seed=RANDOM_SEED,
        logging_steps=10,
        remove_unused_columns=False,
    )

    trainer_urgency = Trainer(
        model=urgency_model,
        args=training_args_urgency,
        train_dataset=urgency_ds_train,
        eval_dataset=urgency_ds_test,
        tokenizer=tokenizer,
        compute_metrics=compute_metrics
    )

    # Train/Save (uncomment to run)
    # trainer_urgency.train()
    # trainer_urgency.save_model("models/hf_urgency_model")
    # tokenizer.save_pretrained("models/hf_urgency_model")

    # =========================
    # Inference helper (baseline + HF)
    # =========================
    if len(train_df) > 0:
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
        try:
            prediction = predict_ticket_baseline(sample_text)
            print(f"\nSample prediction for: '{sample_text}'")
            print(f"Predicted type: {prediction['type']}")
            print(f"Predicted urgency: {prediction['urgency']}")
        except Exception as e:
            print(f"Error in prediction: {e}")
    else:
        print("No models trained. Prediction function not available.")

    # If you fine-tuned HF and saved it: load models and tokenizer, then:
    # hf_type = AutoModelForSequenceClassification.from_pretrained("models/hf_type_model").to(device)
    # hf_tokenizer = AutoTokenizer.from_pretrained("models/hf_type_model")
    # Use Trainer.predict or do manual forward pass.

    # =========================
    # Quick notes & production tips
    # =========================
    # - Data: label quality matters. Standardize ticket texts (concatenate subject + body).
    # - Multitask: For efficiency, consider a single transformer with two classification heads (multi-task), sharing encoder weights.
    # - Ordinal urgency: If urgency is ordinal (low < medium < high) consider ordinal regression or treat labels as ordered and/or predict probability and threshold.
    # - Imbalanced: Use class_weight, focal loss, or oversample minority classes.
    # - Explainability: Use shap, LIME, or show top tokens from TF-IDF for quick explainability.
    # - Active learning: let model flag low-confidence items for human labeling to improve dataset.
    # - Serving: wrap baseline or HF inference in a FastAPI app and serve via Uvicorn / containers.
    #
    # =========================
    # Example minimal FastAPI wrapper (baseline)
    # =========================
    # Uncomment the following lines to create a FastAPI app
    # Make sure to install FastAPI first: pip install fastapi uvicorn

    # try:
    #     from fastapi import FastAPI
    #     from pydantic import BaseModel
    #
    #     app = FastAPI()
    #
    #     class TicketIn(BaseModel):
    #         text: str
    #
    #     @app.post("/predict")
    #     def predict(ticket: TicketIn):
    #         res = predict_ticket_baseline(ticket.text)
    #         return res
    #
    #     # Run: uvicorn Filter:app --reload --port 8000
    #     print("FastAPI app created. Run with: uvicorn Filter:app --reload --port 8000")
    # except ImportError:
    #     print("FastAPI not installed. Install with: pip install fastapi uvicorn")

    # =========================
    # Done
    # =========================
else:
    print("Dataframe is empty. Model training skipped.")