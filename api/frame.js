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
    
    // Log the button click for debugging
    console.log('Frame button clicked:', {
      buttonIndex: untrustedData?.buttonIndex,
      fid: untrustedData?.fid,
      messageHash: untrustedData?.messageHash,
      network: untrustedData?.network,
      timestamp: untrustedData?.timestamp
    });

    // Return HTML response for Frame that launches mini app
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="🧩 Sudoku - Launched!" />
          <meta property="og:description" content="Launching Sudoku game in webview..." />
          <meta property="og:image" content="https://mini-app-roan-three.vercel.app/preview-image.png" />
          
          <!-- Frame Meta Tags -->
          <meta name="fc:frame" content="vNext" />
          <meta name="fc:frame:image" content="https://mini-app-roan-three.vercel.app/preview-image.png" />
          <meta name="fc:frame:button:1" content="🎮 Play Now" />
          <meta name="fc:frame:button:1:action" content="post" />
          <meta name="fc:frame:post_url" content="https://mini-app-roan-three.vercel.app/api/launch" />
        </head>
        <body>
          <h1>🧩 Sudoku Game Launched!</h1>
          <p>The game should open in Warpcast webview.</p>
          <p>If it doesn't open automatically, <a href="https://mini-app-roan-three.vercel.app?fc=true">click here</a></p>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Frame handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 