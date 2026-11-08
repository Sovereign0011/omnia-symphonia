import os
import unittest
import sys
import types
from unittest.mock import patch
from fastapi.testclient import TestClient
import server

class OmniaSymphoniaTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(server.app)
        self.old_key = os.environ.pop('OPENAI_API_KEY', None)

    def tearDown(self):
        os.environ.pop('OPENAI_API_KEY', None)
        if self.old_key is not None:
            os.environ['OPENAI_API_KEY'] = self.old_key

    def test_home_serves_dashboard(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('OMNIA', response.text)
        # index.html links assets relatively (./styles.css, ./app.js), which is
        # what also works on static-only hosting. The old test expected
        # /static/... links that the page never contained.
        self.assertIn('href="./styles.css"', response.text)
        self.assertIn('src="./app.js"', response.text)

    def test_static_assets_load(self):
        css = self.client.get('/static/styles.css')
        js = self.client.get('/static/app.js')
        self.assertEqual(css.status_code, 200)
        self.assertIn('core-stage', css.text)
        self.assertEqual(js.status_code, 200)
        self.assertIn('/api/chat', js.text)

    def test_static_does_not_expose_server_code(self):
        # /static is an allowlist of public assets only. Server code, tests,
        # and env examples must not be readable through it.
        for path in ('/static/server.py', '/static/test_server.py',
                     '/static/.env.example', '/static/README.md'):
            response = self.client.get(path)
            self.assertEqual(response.status_code, 404, path)

    def test_health_without_key(self):
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()['model_configured'])
        self.assertEqual(response.json()['status'], 'ok')

    def test_chat_without_key_returns_clear_error(self):
        response = self.client.post('/api/chat', json={'message': 'Hello'})
        self.assertEqual(response.status_code, 503)
        self.assertIn('No model configured', response.json()['detail'])

    def test_chat_success_with_mocked_provider(self):
        os.environ['OPENAI_API_KEY'] = 'test-key-not-real'
        fake_module = types.ModuleType('openai')
        class FakeResponses:
            def create(self, **kwargs):
                self.kwargs = kwargs
                return types.SimpleNamespace(output_text='Mocked AI response')
        class FakeClient:
            def __init__(self, api_key):
                self.responses = FakeResponses()
        fake_module.OpenAI = FakeClient
        with patch.dict(sys.modules, {'openai': fake_module}):
            response = self.client.post('/api/chat', json={'message': 'Test prompt'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['reply'], 'Mocked AI response')

    def test_chat_rejects_empty_message(self):
        response = self.client.post('/api/chat', json={'message': ''})
        self.assertEqual(response.status_code, 422)

    def test_chat_rejects_oversized_message(self):
        response = self.client.post('/api/chat', json={'message': 'x' * 12001})
        self.assertEqual(response.status_code, 422)

if __name__ == '__main__':
    unittest.main(verbosity=2)
