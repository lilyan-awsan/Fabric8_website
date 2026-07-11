export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  
  const { password } = req.body;
  const adminPass = process.env.ADMIN_PASSWORD;
  
  if (!adminPass) {
    return res.status(500).json({ success: false, message: 'Server is missing ADMIN_PASSWORD environment variable.' });
  }

  if (password === adminPass) {
    // Return a simple static token. In a real app we'd use JWT, but this is a simple static CMS.
    // The githubSync API will also just check the ADMIN_PASSWORD.
    return res.status(200).json({ success: true, token: adminPass });
  }
  
  return res.status(401).json({ success: false, message: 'Invalid password' });
}
