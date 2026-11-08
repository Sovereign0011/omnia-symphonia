import os
import json
import unittest

BASE = os.path.dirname(__file__)

def read(name):
    with open(os.path.join(BASE, name), encoding="utf-8") as handle:
        return handle.read()

class LocalModelUiTests(unittest.TestCase):
    def test_button_exists(self):
        html = read("index.html")
        self.assertIn('id="localModelBtn"', html)
        self.assertIn('id="modelStatus"', html)

    def test_webllm_load_path_exists(self):
        js = read("app.js")
        self.assertIn("@mlc-ai/web-llm", js)
        self.assertIn("Llama-3.2-1B-Instruct-q4f16_1-MLC", js)
        self.assertIn("localEngine.chat.completions.create", js)

    def test_webgpu_fallback_exists(self):
        js = read("app.js")
        self.assertIn("WebGPU unavailable", js)
        self.assertIn("demoReply(text)", js)

    def test_pwa_manifest_valid(self):
        data = json.loads(read("manifest.webmanifest"))
        self.assertEqual(data["name"], "Omnia Symphonia AI")
        self.assertEqual(data["display"], "standalone")

    def test_service_worker_registered(self):
        html = read("index.html")
        self.assertIn('serviceWorker.register', html)
        self.assertIn('self.addEventListener("fetch"', read("sw.js"))

if __name__ == "__main__":
    unittest.main()
