from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.api.chatbot import router as chatbot_router   # ← NEW

app = FastAPI(
    title="Virtual Science Lab Backend",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(chatbot_router)   # ← NEW  (mounts at /api/chatbot/ask)

@app.get("/")
def root():
    return {"status": "Backend is running 🚀"}
