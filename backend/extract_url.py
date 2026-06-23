import requests
import re

html_url = "https://smart-canteen.karthick.site/admin/login"
try:
    response = requests.get(html_url)
    html = response.text
    # Find all script src attributes
    scripts = re.findall(r'<script[^>]+src="([^"]+)"', html)
    
    for script in scripts:
        js_url = f"https://smart-canteen.karthick.site{script}" if script.startswith("/") else script
        print(f"Fetching {js_url}")
        js_res = requests.get(js_url)
        # Search for URLs in the JS bundle
        urls = set(re.findall(r'"(https?://[^"]+)"', js_res.text))
        for url in urls:
            if "localhost" not in url and "w3.org" not in url and "react" not in url:
                print("Found URL:", url)
except Exception as e:
    print(e)
