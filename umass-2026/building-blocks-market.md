# Building Blocks Market

| 📁 Category  |  👨‍💻 Creator | 📝 Writeup By |
|---------------|-------------|------------|
 Web      | lithiumsodium      | darius-it

**Description:**
> I have this ultra rare Star Wars set that I want to sell, but the admin of the site thinks it's fake! Can you help me figure out a way?

## Solution 
This challenge follows a similar pattern to some other challenges in this CTF. Basically, we need an entry point to trigger a Puppeteer bot which has higher privileges and can be used to exfiltrate our flag.

In this case, the solution consisted of three parts:
1. Exfiltrate CSRF Token
2. Approval payload using automated Puppeteer bot
3. Navigate to `/flag` route and get our flag :) This route only shows a correct flag if we have one approved product, which we have achieved using our automated bot.
   
### Step 1: Exfiltrate CSRF Token
We can abuse caching to exfiltrate a CSRF token of the admin account combined with some trickery regarding the sanitization logic. We need this CSRF (Cross-Site Request Forgery) token to sneak in a HTTP request to an automated web scraper bot which has admin privileges.

The website runs a custom proxy, which identifies cacheable files by their extension (e.g., .js) but truncates paths at CRLF characters (`%0d%0a`) before requesting them from the backend.

```python
def _upstream(self, method, body=None):
	# ... 
    clean_path = re.split(r'%0d%0a', self.path, flags=re.IGNORECASE)[0]
    # ..., the clean_path later gets requested from the backend
    # this method is executed on GET requests to our proxy
```

By forcing the bot to visit `/admin/submissions.html%0d%0a.js` through the submissions page, the proxy caches the admin's private HTML page as a static javascript file, because our bot runs with admin privileges. We then access that cached file to read the admin's CSRF token from the source code.

Searching through the returned HTML, we find the Admin's deterministic CSRF token: 
```html
<input type="hidden" name="csrf_token" value="e0858087452e9745bf41a5496fbc4c49296ac1794b87afe96d2ca1ab169869c9"> 
```

### Step 2: Approval Payload using Bot
After we have the CSRF token, we can host a simple HTML including our payload script, which includes the CSRF token and sends a POST request to the approval route. We pass the URL of our payload the Puppeteer bot, which triggers the payload execution and approves a product we have created earlier.

We can spin up a simple FastAPI server on local port `8000` to serve an auto-submitting HTML form using the leaked token.

```html 
<!DOCTYPE html> 
<html> 
	<body>
	<form id="auto-submit" action="http://cache_proxy:5555/approval/approve/6" method="POST"> 
		<input type="hidden" name="csrf_token" value="e0858087452e9745bf41a5496fbc4c49296ac1794b87afe96d2ca1ab169869c9"> </form> 
	
	<script> 
		// Automatically execute the CSRF attack when the bot loads the page 
		document.getElementById('auto-submit').submit(); 
	</script> 
	</body> 
</html>
```

The bot on the submissions page is an automated headless browser that holds Admin session cookies. It visits any URL provided in a product submission. Because it runs with `--disable-features=SameSiteByDefaultCookies`, it will send its session cookies along with our cross-site POST request. 

We serve the payload using an ngrok-like tunnel (I used a pinggy TCP tunnel to bypass warning pages). The payload targets the `/approval/approve/[ID]` endpoint using the leaked token and a pre-created product ID.

Assuming we had a product created with the correct ID, our bot will go and approve the product, which will trigger the success state for the `/flag` route!

### Step 3: Profit
Navigate to `/flag` route and get the flag :) This route only shows a correct flag if we have one approved product, which we have achieved using our automated bot.
