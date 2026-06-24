import urllib.request
import urllib.error
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def http_request(url, method="GET", data=None, headers=None):
    headers = headers or {}
    data_bytes = None
    if data is not None:
        data_bytes = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
        
    req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5.0) as response:
            status = response.status
            body_str = response.read().decode("utf-8")
            try:
                body = json.loads(body_str)
            except Exception:
                body = body_str
            return status, body
    except urllib.error.HTTPError as e:
        body_str = e.read().decode("utf-8")
        try:
            body = json.loads(body_str)
        except Exception:
            body = body_str
        return e.code, body
    except Exception as e:
        return 500, str(e)

def run_verification():
    results = {}
    
    # 1. Health check
    print("Checking health endpoint...")
    t0 = time.time()
    status, body = http_request(f"{BASE_URL}/health", "GET")
    t_health = time.time() - t0
    results["health_status"] = status
    results["health_time"] = t_health
    results["health_data"] = body
    print(f"Health check: {status} in {t_health:.4f}s")
    if status != 200:
        print("Health check failed!")
        return
        
    # 2. Session lifecycle
    print("\nCreating new session...")
    t0 = time.time()
    status, body = http_request(f"{BASE_URL}/session", "POST")
    t_session = time.time() - t0
    results["session_status"] = status
    results["session_time"] = t_session
    print(f"Session Response: {status} in {t_session:.4f}s")
    
    if status not in (200, 201):
        print("Session creation failed!")
        return
        
    session_id = body.get("session_id") or body.get("sessionId")
    results["session_id"] = session_id
    print(f"Session created ID: {session_id}")

    # 3. Conversation Flow
    flow = [
        "I'm Shadab",
        "Tell me about Petal n Pins",
        "Show it again",
        "Tell me about Python",
        "Tell me more",
        "What do you remember about me?",
        "What were we talking about?",
        "What projects interested me?"
    ]
    
    memory = {
        "sessionId": session_id,
        "visitCount": 1,
        "topics": [],
        "questions": []
    }
    history = []
    flow_results = []
    
    print("\nStarting conversation flow...")
    for text in flow:
        payload = {
            "text": text,
            "memory": memory,
            "history": history
        }
        
        print(f"\nUser: {text}")
        t0 = time.time()
        status, resp_data = http_request(f"{BASE_URL}/query", "POST", data=payload)
        elapsed = time.time() - t0
        
        if status != 200:
            print(f"Query failed with status {status}: {resp_data}")
            break
            
        print(f"NOVA: {resp_data.get('reply')}")
        print(f"Intent: {resp_data.get('intent')} (confidence: {resp_data.get('confidence')})")
        print(f"Action: {resp_data.get('action')}, Preview Category: {resp_data.get('preview', {}).get('type') if resp_data.get('preview') else 'None'}")
        print(f"Response Time: {elapsed:.4f}s")
        
        # Update memory and history for next turn
        memory = resp_data.get("updated_memory")
        
        # Format history message
        history.append({"role": "user", "content": text})
        history.append({"role": "nova", "content": resp_data.get("reply")})
        
        flow_results.append({
            "query": text,
            "reply": resp_data.get("reply"),
            "intent": resp_data.get("intent"),
            "confidence": resp_data.get("confidence"),
            "action": resp_data.get("action"),
            "preview_type": resp_data.get("preview", {}).get('type') if resp_data.get('preview') else None,
            "elapsed": elapsed,
            "memory": memory
        })
            
    results["flow"] = flow_results
    
    # 4. Persistence check
    print("\nRestart verification (Memory persistence test)...")
    payload = {
        "text": "Have we met before?",
        "memory": memory,
        "history": []
    }
    status, data = http_request(f"{BASE_URL}/query", "POST", data=payload)
    print(f"NOVA (persistence check status {status}): {data.get('reply') if isinstance(data, dict) else data}")
    results["persistence_check"] = data.get("reply") if isinstance(data, dict) else str(data)
        
    # Write report
    with open("verification_report.json", "w") as f:
        json.dump(results, f, indent=2)
    print("\nVerification report written to verification_report.json")

if __name__ == "__main__":
    run_verification()
