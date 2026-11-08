# Omnia Symphonia — fixes applied to the uploaded prototype

Source: `workspace/user/files/omnia_symphonia_android_pwa_0_814j.zip`
SHA-256 of the original zip, verified unchanged after this work:
`645c39b55d4de6daff83ad9fdaa2c9122788f74f42cc20093766752d78bdcd70`

The original zip was NOT modified. This folder is a separate working copy.
Nothing was deployed, no server was started on a public port, and no API
key was used. Tests ran in-process with FastAPI's TestClient, with
`OPENAI_API_KEY` unset and the provider mocked where needed.

## Before (measured, 2026-10-25)
- `test_local_model.py`: 5/5 passed
- `test_server.py`: 6/7 passed, 1 failed
  - `test_home_serves_dashboard` failed: it expected `/static/styles.css`
    and `/static/app.js` in the home page, but `index.html` links
    `./styles.css` and `./app.js`.
- The README install line alone was not enough to run the server tests:
  `httpx` is required by FastAPI's TestClient and was not listed.
- `/static` mounted the whole project folder, so `/static/server.py`,
  `/static/test_server.py`, `/static/README.md`, and
  `/static/.env.example` were readable over HTTP. No secret was in those
  files in this zip, but the exposure was real.

## Fixes in this copy
1. `test_server.py` — `test_home_serves_dashboard` now asserts the links
   the page actually contains (`href="./styles.css"`, `src="./app.js"`).
   Relative links are correct here because they also work on static-only
   hosting, where there is no `/static` mount.
2. `test_server.py` — added `test_static_does_not_expose_server_code`,
   which asserts 404 for `/static/server.py`, `/static/test_server.py`,
   `/static/.env.example`, and `/static/README.md`.
3. `server.py` — removed the whole-folder `StaticFiles` mount. `/static`
   is now an allowlist route serving only `styles.css`, `app.js`, `sw.js`,
   and `manifest.webmanifest`. Anything else returns 404.
4. `requirements.txt` — added `httpx>=0.27,<1.0` so the documented install
   command actually runs the test suite.

## After
See `TEST_TRANSCRIPT.md` in this folder for the full run output.
- `test_local_model.py`: 5/5 passed
- `test_server.py`: 8/8 passed (7 original, with the home test corrected,
  plus the new static-exposure test)

## Still NOT fixed, by design for a v0.1 prototype
- PWA manifest still has `"icons": []`. A proper 192px/512px icon set
  is still needed for a full Android install experience.
- No authentication, rate limiting, or quotas in `server.py`. The
  README's warning stands: do not expose this directly to the internet.
- The on-device model is the existing open-weight
  `Llama-3.2-1B-Instruct-q4f16_1-MLC` via WebLLM, not a model trained by
  this project, and Android WebGPU support varies by device.
- Capability panels for vision, security, data, and automation remain
  showcase labels. The code honestly reports threat detection as not
  enabled and analytics as needing data and a model.
- No 14-million-parameter model, 512-core cluster, petabyte storage,
  100% threat detection, or 99.99% accuracy pipeline exists in this code.
  Those were claims from the original display art, and the README
  already labels them unverified.
