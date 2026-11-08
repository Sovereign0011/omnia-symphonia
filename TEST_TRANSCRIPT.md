# Omnia Symphonia — fixed-copy test transcript

Run: fresh venv, pip install -r requirements.txt, env -u OPENAI_API_KEY python -m unittest -v test_server test_local_model
No server started on a port, no real API key used, provider mocked where needed.

/home/hatch/workspace/tmp_omnia_venv/lib/python3.12/site-packages/fastapi/testclient.py:1: StarletteDeprecationWarning: Using `httpx` with `starlette.testclient` is deprecated; install `httpx2` instead.
  from starlette.testclient import TestClient as TestClient  # noqa
test_chat_rejects_empty_message (test_server.OmniaSymphoniaTests.test_chat_rejects_empty_message) ... ok
test_chat_rejects_oversized_message (test_server.OmniaSymphoniaTests.test_chat_rejects_oversized_message) ... ok
test_chat_success_with_mocked_provider (test_server.OmniaSymphoniaTests.test_chat_success_with_mocked_provider) ... ok
test_chat_without_key_returns_clear_error (test_server.OmniaSymphoniaTests.test_chat_without_key_returns_clear_error) ... ok
test_health_without_key (test_server.OmniaSymphoniaTests.test_health_without_key) ... ok
test_home_serves_dashboard (test_server.OmniaSymphoniaTests.test_home_serves_dashboard) ... ok
test_static_assets_load (test_server.OmniaSymphoniaTests.test_static_assets_load) ... ok
test_static_does_not_expose_server_code (test_server.OmniaSymphoniaTests.test_static_does_not_expose_server_code) ... ok
test_button_exists (test_local_model.LocalModelUiTests.test_button_exists) ... ok
test_pwa_manifest_valid (test_local_model.LocalModelUiTests.test_pwa_manifest_valid) ... ok
test_service_worker_registered (test_local_model.LocalModelUiTests.test_service_worker_registered) ... ok
test_webgpu_fallback_exists (test_local_model.LocalModelUiTests.test_webgpu_fallback_exists) ... ok
test_webllm_load_path_exists (test_local_model.LocalModelUiTests.test_webllm_load_path_exists) ... ok

----------------------------------------------------------------------
Ran 13 tests in 0.144s

OK
