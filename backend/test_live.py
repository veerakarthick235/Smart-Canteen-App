import requests

API_URL = "https://smart-canteen-backend.onrender.com"

# Create a test user or login as admin if we know credentials. 
# Alternatively, I can just fetch from Vercel to see where it redirects? No, frontend makes request to API.
# Wait, let's just make an HTTP request to the frontend to see what its VITE_API_URL is!
response = requests.get("https://smart-canteen.karthick.site/assets/index.js")
# actually it's compiled, so I can just search for the backend url
print("Fetching Vercel API URL from frontend...")

