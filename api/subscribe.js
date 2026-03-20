// api/subscribe.js
export default async function handler(req, res) {
  // 1. Hanya izinkan method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method Not Allowed. Please use POST.' 
    });
  }

  // 2. Ambil email dari request body
  let email;
  try {
    email = req.body.email;
  } catch (error) {
    return res.status(400).json({ 
      error: 'Invalid request body' 
    });
  }

  // 3. Validasi email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Invalid email address' 
    });
  }

  // 4. Cek apakah API key sudah di-set
  if (!process.env.BREVO_API_KEY) {
    console.error('BREVO_API_KEY is not configured');
    return res.status(500).json({ 
      error: 'Server configuration error' 
    });
  }

  // 5. Kirim ke Brevo API
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
        listIds: [7], // Ganti dengan ID list Anda di Brevo
        updateEnabled: true,
        attributes: {
          SOURCE: 'website_popup'
        }
      }),
    });

    const data = await response.json();

    // 6. Handle response dari Brevo
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
