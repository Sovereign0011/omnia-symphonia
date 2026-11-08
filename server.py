import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = FastAPI(title="Omnia Symphonia", version="0.1.0")

# /static used to mount the whole project folder, which made server.py,
# tests, and env examples readable over HTTP. It now serves only this
# allowlist of public assets; anything else returns 404.
ALLOWED_STATIC = {
    "styles.css": "text/css",
    "app.js": "application/javascript",
    "sw.js": "application/javascript",
    "manifest.webmanifest": "application/manifest+json",
}

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=12000)

@app.get("/")
def home():
    return FileResponse(os.path.join(BASE_DIR, "index.html"))

@app.get("/styles.css")
def stylesheet():
    return FileResponse(os.path.join(BASE_DIR, "styles.css"), media_type="text/css")

@app.get("/app.js")
def javascript():
    return FileResponse(os.path.join(BASE_DIR, "app.js"), media_type="application/javascript")

@app.get("/sw.js")
def service_worker():
    return FileResponse(os.path.join(BASE_DIR, "sw.js"), media_type="application/javascript")

@app.get("/manifest.webmanifest")
def manifest():
    return FileResponse(os.path.join(BASE_DIR, "manifest.webmanifest"), media_type="application/manifest+json")

@app.get("/static/{filename}")
def static_file(filename: str):
    media_type = ALLOWED_STATIC.get(filename)
    if media_type is None:
        raise HTTPException(status_code=404, detail="Not found.")
    return FileResponse(os.path.join(BASE_DIR, filename), media_type=media_type)

@app.get("/api/health")
def health():
    return {"status": "ok", "model_configured": bool(os.getenv("OPENAI_API_KEY")), "model": os.getenv("OPENAI_MODEL", "gpt-4.1-mini")}

@app.post("/api/chat")
def chat(body: ChatRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="No model configured. Set OPENAI_API_KEY in your environment.")
    model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        result = client.responses.create(
            model=model,
            instructions=("You are Omnia Symphonia, a helpful, honest AI assistant. "
                          "Do not claim to have capabilities or access you do not have. "
                          "Be clear when a request requires external tools or verification."),
            input=body.message,
        )
        return {"reply": result.output_text, "model": model}
    except ImportError:
        raise HTTPException(status_code=503, detail="The OpenAI SDK is not installed. Install requirements.txt.")
    except Exception:
        # Avoid leaking credentials or provider error details to the browser.
        raise HTTPException(status_code=502, detail="The model provider request failed. Check server logs and configuration.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host=os.getenv("HOST", "127.0.0.1"), port=int(os.getenv("PORT", "8000")), reload=False)
