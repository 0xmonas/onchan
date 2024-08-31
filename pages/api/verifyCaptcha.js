// export default async function handler(req, res) {
//   if (req.method === 'POST') {
//     const { captchaToken } = req.body;
//     const secretKey = process.env.RECAPTCHA_SECRET_KEY;

//     try {
//       const response = await fetch(
//         `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`,
//         {
//           method: 'POST',
//         }
//       );

//       const data = await response.json();

//       if (data.success) {
//         res.status(200).json({ success: true });
//       } else {
//         res.status(400).json({ success: false, message: 'CAPTCHA verification failed' });
//       }
//     } catch (error) {
//       console.error('Error verifying CAPTCHA:', error);
//       res.status(500).json({ success: false, message: 'Error verifying CAPTCHA' });
//     }
//   } else {
//     res.status(405).json({ success: false, message: 'Method not allowed' });
//   }
// }