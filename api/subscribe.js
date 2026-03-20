// api/subscribe.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Hanya izinkan POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let email;
  try {
    email = req.body.email;
  } catch (error) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  // Validasi email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Cek API key
  if (!process.env.BREVO_API_KEY) {
    console.error('BREVO_API_KEY not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        email: email,
        listIds: [2],
        updateEnabled: true,
        attributes: {
          SOURCE: 'website_popup'
        }
      }),
    });

    const data = await response.json();

    if (response.status === 201 || response.status === 204) {
      return res.status(200).json({ 
        success: true, 
        message: 'Successfully subscribed!' 
      });
    } else {
      console.error('Brevo error:', data);
      return res.status(response.status).json({ 
        error: data.message || 'Failed to subscribe' 
      });
    }
  } catch (error) {
    console.error('Network error:', error);
    return res.status(500).json({ 
      error: 'Network error. Please try again later.' 
    });
  }
}
