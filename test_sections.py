import urllib.request
import json

TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwicm9sZXMiOlsiUk9MRV9BRE1JTiIsIkVYQU1fQ1JFQVRFIiwiRVhBTV9QVUJMSVNIIiwiRVhBTV9DTE9TRSIsIkVYQU1fVklFVyIsIkVYQU1fREVMRVRFIiwiRVhBTV9SRVNUT1JFIiwiRVhBTV9IQVJEX0RFTEVURSJdLCJpYXQiOjE2MTYyMzkwMjJ9.dummy-signature'
API_BASE = 'http://192.168.1.63:5151/api'
HEADERS = {
    'Authorization': f'Bearer {TOKEN}',
    'Content-Type': 'application/json'
}

def make_request(method, url):
    try:
        req = urllib.request.Request(f"{API_BASE}{url}", headers=HEADERS, method=method)
        with urllib.request.urlopen(req) as response:
            return response.status, response.read().decode('utf-8')
    except Exception as e:
        return 500, str(e)

print("\n--- Fetching Exam 2 Sections ---")
status, body = make_request("GET", "/exams/2/sections")
print(f"Status: {status}")
if status == 200:
    data = json.loads(body)
    print(f"Found {len(data)} sections.")
    for sec in data:
        print(f"Section ID: {sec.get('examSectionId')}, Title: {sec.get('section', {}).get('sectionName')}")
        qs = sec.get('examQuestions', [])
        print(f"  -> Questions length: {len(qs)}")
        if qs:
             print(f"  -> First Q ID: {qs[0].get('questionId')}")
else:
    print(f"Failed to fetch sections: {body}")
