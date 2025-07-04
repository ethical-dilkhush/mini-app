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
    
    // Log the launch action
    console.log('Mini app launch requested:', {
      buttonIndex: untrustedData?.buttonIndex,
      fid: untrustedData?.fid,
      timestamp: untrustedData?.timestamp
    });

    // Return HTML response that launches the mini app
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="🧩 Sudoku - Play Now!" />
          <meta property="og:description" content="Click to play Sudoku in webview" />
          <meta property="og:image" content="https://mini-app-roan-three.vercel.app/preview-image.png" />
          
          <!-- Frame Meta Tags -->
          <meta name="fc:frame" content="vNext" />
          <meta name="fc:frame:image" content="https://mini-app-roan-three.vercel.app/preview-image.png" />
          <meta name="fc:frame:image:aspect_ratio" content="1.91:1" />
          <meta name="fc:frame:button:1" content="🎮 Launch Game" />
          <meta name="fc:frame:button:1:action" content="post" />
          <meta name="fc:frame:post_url" content="https://mini-app-roan-three.vercel.app/api/webview" />
          
          <!-- Mini App Launch Meta Tags -->
          <meta name="fc:miniapp" content='{"version":"1","imageUrl":"https://mini-app-roan-three.vercel.app/preview-image.png","button":{"title":"🎮 Launch Game","action":{"type":"launch_miniapp","url":"https://mini-app-roan-three.vercel.app","name":"Sudoku - Farcaster Mini App","splashImageUrl":"https://mini-app-roan-three.vercel.app/preview-image.png","splashBackgroundColor":"#8b5cf6"}}}' />
        </head>
        <body>
          <h1>🧩 Ready to Play!</h1>
          <p>Click the button to launch Sudoku in webview.</p>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Launch handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 