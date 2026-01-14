import { Controller, Get, Header } from '@nestjs/common';

@Controller('oauth')
export class CallbackPagesController {
  @Get('extension-callback')
  @Header('Content-Type', 'text/html')
  getExtensionCallback(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OAuth Callback</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      text-align: center;
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 400px;
    }
    .success {
      color: #10b981;
    }
    .error {
      color: #ef4444;
    }
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 1rem auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h1 {
      margin-top: 0;
      font-size: 1.5rem;
    }
    p {
      color: #6b7280;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h1 id="title">Processing OAuth Callback...</h1>
    <p id="message">Please wait while we complete the authorization.</p>
  </div>

  <script>
    (function() {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      const titleEl = document.getElementById('title');
      const messageEl = document.getElementById('message');
      const spinner = document.querySelector('.spinner');

      // Handle OAuth error response
      if (error) {
        spinner.style.display = 'none';
        titleEl.textContent = 'Authorization Failed';
        titleEl.className = 'error';
        messageEl.textContent = errorDescription || error;
        
        window.postMessage({
          type: 'oauth-callback-error',
          error: error,
          error_description: errorDescription
        }, '*');
        
        setTimeout(() => window.close(), 3000);
        return;
      }

      // Validate required parameters
      if (!code || !state) {
        spinner.style.display = 'none';
        titleEl.textContent = 'Invalid Callback';
        titleEl.className = 'error';
        messageEl.textContent = 'Missing required parameters (code or state). This callback URL is invalid.';
        
        window.postMessage({
          type: 'oauth-callback-error',
          error: 'invalid_request',
          error_description: 'Missing required parameters'
        }, '*');
        
        setTimeout(() => window.close(), 3000);
        return;
      }

      // Send authorization code and state to extension
      window.postMessage({
        type: 'oauth-callback-success',
        code: code,
        state: state
      }, '*');

      // Update UI to show success
      spinner.style.display = 'none';
      titleEl.textContent = 'Authorization Successful!';
      titleEl.className = 'success';
      messageEl.textContent = 'You can close this window now. Redirecting to extension...';

      // Auto-close window after a brief delay
      setTimeout(() => {
        window.close();
      }, 2000);
    })();
  </script>
</body>
</html>
    `;
  }
}
