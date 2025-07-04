export default function handler(req, res) {
  // Set CORS headers for Farcaster
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Parse the Frame button click data
    const { untrustedData, trustedData } = req.body;
    
    // Log the webview launch
    console.log('Webview launch requested:', {
      buttonIndex: untrustedData?.buttonIndex,
      fid: untrustedData?.fid,
      timestamp: untrustedData?.timestamp
    });

    // Return HTML response that opens in webview
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="🧩 Sudoku - Game Launched!" />
          <meta property="og:description" content="Sudoku game is now opening in webview" />
          <meta property="og:image" content="https://mini-app-roan-three.vercel.app/preview-image.png" />
          
          <!-- Frame Meta Tags -->
          <meta name="fc:frame" content="vNext" />
          <meta name="fc:frame:image" content="https://mini-app-roan-three.vercel.app/preview-image.png" />
          <meta name="fc:frame:image:aspect_ratio" content="1.91:1" />
          
          <!-- Webview Launch -->
          <script>
            // Redirect to the app with fc parameter
            window.location.href = 'https://mini-app-roan-three.vercel.app?fc=true';
          </script>
        </head>
        <body>
          <h1>🧩 Launching Sudoku Game...</h1>
          <p>The game is opening in webview...</p>
          <p><a href="https://mini-app-roan-three.vercel.app?fc=true">Click here if not redirected</a></p>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Webview handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 