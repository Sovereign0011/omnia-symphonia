# Omnia Symphonia — AI Command Center

A responsive sci-fi dashboard inspired by the concept artwork. This starter includes animated CSS visuals, capability panels, a chat UI, a local demo fallback, and an optional Python/FastAPI backend for live responses from an OpenAI model.

## What works now
- Responsive layout for mobile and desktop.
- Animated neural-core illustration and starfield, created with CSS (no external image assets).
- Interactive chat panel with clearly labelled demo responses.
- Health endpoint that reports whether a model key is configured.
- Optional model-backed chat endpoint.
- Server-side API key handling; the key is never sent to the browser.

## Important limits
This is a prototype, not a trained foundation model or a production deployment. No real 14-million-parameter neural network, 512-core cluster, petabyte storage, cyber-threat detection, or predictive analytics pipeline is included. The metrics in the original concept art were not verified; this project intentionally labels capability status honestly. Real model calls can incur API charges and require an account/provider access.

## Run the visual demo
Requires Python 3.10+.

```bash
python -m venv .venv
# macOS/Linux:
source .venv/bin/activate
# Windows PowerShell:
# .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
uvicorn server:app --host 127.0.0.1 --port 8000
```
Open http://127.0.0.1:8000 in your browser. Without an API key, chat falls back to demo responses.

## Enable real AI responses
1. Obtain an API key from your chosen provider.
2. Set it in the server process environment; do not paste it into `app.js`, `index.html`, screenshots, or public source control.

macOS/Linux:
```bash
export OPENAI_API_KEY="your-key"
export OPENAI_MODEL="gpt-4.1-mini"
uvicorn server:app --host 127.0.0.1 --port 8000
```

Windows PowerShell:
```powershell
$env:OPENAI_API_KEY="your-key"
$env:OPENAI_MODEL="gpt-4.1-mini"
uvicorn server:app --host 127.0.0.1 --port 8000
```

Restart the server after setting environment variables. The model name must be available to your account. The API key stays on the server.

## Before production
- Add authentication, rate limiting, request quotas, and abuse protection.
- Use HTTPS and a managed secrets store.
- Add logging with privacy controls, monitoring, automated tests, and deployment configuration.
- Review privacy, retention, and data-processing requirements before accepting sensitive information.
- Add real datasets, evaluations, and validated pipelines for vision, analytics, or security features.
- Do not expose this development server directly to the public internet.

## Project files
- `index.html` — dashboard structure
- `styles.css` — visual theme and responsive styling
- `app.js` — interactive chat and demo fallback
- `server.py` — optional FastAPI backend
- `requirements.txt` — Python dependencies

## Automated checks
With dependencies installed, run:
```bash
python -m unittest -v test_server.py
node --check app.js
```
The tests cover the dashboard route, static assets, health status, and API input/configuration errors. A successful local test run does not replace provider credentials, browser/device testing, or production security review.


## Optional on-device AI (Android/browser)
The dashboard includes **Load on-device AI model**, using WebLLM with the quantized `Llama-3.2-1B-Instruct-q4f16_1-MLC` model. This is an existing open-weight model, not a foundation model trained from scratch by this project. The browser downloads model files on first use; download size and device memory needs can be substantial.

Requirements/limitations:
- Use a current browser with WebGPU support. Android WebGPU support varies by device, browser version, and graphics driver.
- The first model load requires internet access. Subsequent availability depends on browser cache/storage policy.
- Model execution happens in the browser on the device when supported; the model provider is not called for local inference. The model files are fetched from the model runtime's distribution infrastructure.
- If WebGPU or memory requirements are unavailable, use demo mode or the optional server-side model integration.
- Do not assume the local model has the accuracy or capabilities of a larger cloud model.
- For a public website, serve over HTTPS. Local development on `localhost` is also treated as a secure context by modern browsers.


## Android browser deployment (static PWA shell)
The project now includes `manifest.webmanifest` and `sw.js` so the dashboard shell can be installable and its basic assets cached by a compatible browser. This does **not** cache the model weights or make a model download work offline automatically.

### Quick route using a static host
1. Upload the contents of this folder to a static HTTPS host (for example, a static-site hosting service or a repository's Pages feature).
2. Ensure `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, and `sw.js` are at the same published path.
3. Open the HTTPS site in Chrome on Android.
4. If the browser offers **Install app** or **Add to Home screen**, use it.
5. Test the dashboard first. Then tap **Load on-device AI model** on Wi-Fi and keep the page open while the model downloads.
6. If WebGPU is unavailable, the UI will report that and the app can still use demo mode or a configured server backend.

### Static host versus Python backend
Static hosting serves the dashboard only; it does not run `server.py`. Therefore the optional `/api/chat` endpoint is unavailable on a static-only deployment. To use server-side AI, deploy the FastAPI backend separately to a Python-capable host and configure its secret environment variable there. Never put an API key in frontend files.

### Android test checklist
- HTTPS loads without certificate warnings.
- Dashboard panels fit the screen without horizontal scrolling.
- Send a demo chat message and see a response.
- Tap model load and record the exact error/status if unsupported.
- Check browser storage and available memory if model loading fails.
- Test refresh/reopen before relying on offline behavior.
