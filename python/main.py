# python/main.py
import os
from typing import Optional
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Reuse your existing class
from ticket_classifier import TicketClassifier

CLASSIFIER_KEY = os.getenv("CLASSIFIER_KEY")  # shared secret with Next.js

app = FastAPI(title="Ticket Classifier")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

class ClassifyIn(BaseModel):
    title: Optional[str] = None
    message: str

class ClassifyOut(BaseModel):
    department: str
    priority: str
    confidence_type: float
    confidence_urgency: float

# Load once
clf = TicketClassifier()
if not clf.is_ready():
    # Will train if models not present; or you can run python/train_models.py first
    clf.train()

@app.get("/health")
def health():
    return {"ok": True, "models": clf.is_ready()}

@app.post("/classify", response_model=ClassifyOut)
def classify(body: ClassifyIn, x_classifier_key: Optional[str] = Header(None)):
    # simple auth
    if CLASSIFIER_KEY and x_classifier_key != CLASSIFIER_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized classifier key")

    text = ((body.title or "") + " " + (body.message or "")).strip()
    if not text:
        return ClassifyOut(
            department="other",
            priority="medium",
            confidence_type=0.0,
            confidence_urgency=0.0,
        )

    res = clf.predict(text)
    department = str(res["type"]).lower()      # hardware/network/software/account/other
    priority   = str(res["urgency"]).lower()   # low/medium/high
    return ClassifyOut(
        department=department,
        priority=priority,
        confidence_type=res["confidence_type"],
        confidence_urgency=res["confidence_urgency"],
    )
