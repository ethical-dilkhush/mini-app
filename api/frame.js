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

    // Return HTML response for Frame
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="og:title" content="🧩 Sudoku - Farcaster Mini App" />
          <meta property="og:description" content="Play Sudoku puzzles with multiple difficulty levels!" />
          <meta property="og:image" content="https://mini-app-roan-three.vercel.app/preview-image.png" />
          
          <!-- Frame Meta Tags -->
          <meta name="fc:frame" content="vNext" />
          <meta name="fc:frame:image" content="https://mini-app-roan-three.vercel.app/preview-image.png" />
          <meta name="fc:frame:button:1" content="🎮 Launch Game" />
          <meta name="fc:frame:button:1:action" content="link" />
          <meta name="fc:frame:button:1:target" content="https://mini-app-roan-three.vercel.app?fc=true" />
          
          <!-- Redirect to the actual app -->
          <script>
            window.location.href = "https://mini-app-roan-three.vercel.app?fc=true";
          </script>
        </head>
        <body>
          <h1>🧩 Sudoku Game</h1>
          <p>Launching Sudoku game...</p>
          <p><a href="https://mini-app-roan-three.vercel.app?fc=true">Click here if not redirected automatically</a></p>
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