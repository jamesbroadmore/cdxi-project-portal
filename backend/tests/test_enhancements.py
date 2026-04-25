"""
Backend tests for cdxi | OS post-enhancement validation.
Covers:
 - Auth with parker@cdxi.au
 - Projects list + PATCH status (Kanban backend)
 - Invoice Stripe checkout (POST /api/invoices/{id}/checkout)
 - Agent workflow demo (POST /api/agents/workflow-demo) and runs persistence
"""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "parker@cdxi.au"
ADMIN_PASSWORD = "cdxi2026!"


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "access_token" in data
    assert data["user"]["email"] == ADMIN_EMAIL
    return data["access_token"]


@pytest.fixture(scope="session")
def headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# --- Auth ---
class TestAuth:
    def test_login_success(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["user"]["role"] == "admin"
        assert len(d["access_token"]) > 20

    def test_login_invalid(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=30)
        assert r.status_code == 401


# --- Projects (Kanban backend) ---
class TestProjects:
    def test_list_projects(self, headers):
        r = requests.get(f"{API}/projects", headers=headers, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        # Validate fields used by Kanban
        p = data[0]
        for k in ("id", "name", "status"):
            assert k in p

    def test_patch_project_status_persists(self, headers):
        r = requests.get(f"{API}/projects", headers=headers, timeout=30)
        assert r.status_code == 200
        projects = r.json()
        # pick m8s rates so we don't disturb completed one
        target = next((p for p in projects if p["name"] == "m8s rates"), projects[0])
        original = target["status"]
        pid = target["id"]
        try:
            # Move to Blocked
            r2 = requests.patch(f"{API}/projects/{pid}", headers=headers,
                                json={"status": "Blocked"}, timeout=30)
            assert r2.status_code == 200, r2.text
            # GET and verify persistence
            r3 = requests.get(f"{API}/projects", headers=headers, timeout=30)
            new = next(p for p in r3.json() if p["id"] == pid)
            assert new["status"].lower() == "blocked"
        finally:
            # restore
            requests.patch(f"{API}/projects/{pid}", headers=headers,
                           json={"status": original}, timeout=30)


# --- Invoices + Stripe ---
class TestInvoiceStripe:
    def test_seed_invoice_present(self, headers):
        r = requests.get(f"{API}/invoices", headers=headers, timeout=30)
        assert r.status_code == 200
        invoices = r.json()
        target = next((i for i in invoices if i.get("invoice_number") == "INV-2026-001"), None)
        assert target is not None, "Seed invoice INV-2026-001 missing"
        assert target["status"] == "sent"

    def test_invoice_checkout_returns_stripe_url(self, headers):
        # invoice id from seed
        inv_id = "inv-demo-001"
        r = requests.post(f"{API}/invoices/{inv_id}/checkout", headers=headers,
                          json={"origin_url": BASE_URL}, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "url" in data
        assert data["url"].startswith("https://checkout.stripe.com/"), f"Unexpected url: {data['url']}"
        assert "session_id" in data
        assert data["session_id"].startswith("cs_")


# --- Agent workflow demo ---
class TestAgentWorkflow:
    def test_workflow_demo_runs_three_steps(self, headers):
        # capture runs count before
        r0 = requests.get(f"{API}/agents/runs", headers=headers, timeout=30)
        assert r0.status_code == 200
        before = len(r0.json())

        t0 = time.time()
        r = requests.post(f"{API}/agents/workflow-demo", headers=headers,
                          json={}, timeout=120)
        elapsed = time.time() - t0
        assert r.status_code == 200, r.text
        data = r.json()

        # validate top-level shape
        assert "steps" in data
        steps = data["steps"]
        assert isinstance(steps, list) and len(steps) == 3
        agent_keys = [s.get("agent") for s in steps]
        assert "chief_orchestrator" in agent_keys
        assert "finance" in agent_keys
        assert "client_success" in agent_keys

        for s in steps:
            assert "confidence_score" in s
            assert "output" in s
            assert "execution_status" in s
            assert isinstance(s["confidence_score"], (int, float))
            assert s["execution_status"] in ("complete", "pending_review", "cancelled")

        # summary footer fields
        assert "summary" in data
        assert "average_confidence" in data["summary"]

        print(f"workflow-demo elapsed: {elapsed:.1f}s")

        # runs persisted
        r1 = requests.get(f"{API}/agents/runs", headers=headers, timeout=30)
        assert r1.status_code == 200
        after = len(r1.json())
        assert after >= before + 3, f"Expected +3 runs, got before={before} after={after}"
