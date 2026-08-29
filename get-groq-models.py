import urllib.request
import re

url = "https://console.groq.com/docs/models"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')

# Search for llama-3.2 vision model strings in the HTML
models = re.findall(r'llama-3[a-zA-Z0-9.-]*vision[a-zA-Z0-9.-]*', html)
print(list(set(models)))
