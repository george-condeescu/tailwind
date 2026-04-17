import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// POST /api/contact
router.post('/', upload.single('attachment'), async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, message: 'Câmpurile nume, email și mesaj sunt obligatorii.' });
  }

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: 'cjt@cjteleorman.ro',
    replyTo: email,
    subject: `Mesaj nou de pe site – ${name}`,
    text: `Nume: ${name}\nEmail: ${email}\n\nMesaj:\n${message}`,
    html: `
      <p><strong>Nume:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <hr/>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `,
    attachments: req.file
      ? [
          {
            filename: req.file.originalname,
            content: req.file.buffer,
            contentType: req.file.mimetype,
          },
        ]
      : [],
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error('Eroare trimitere email contact:', err);
    res.status(500).json({ success: false, message: 'Eroare la trimiterea mesajului.' });
  }
});

export default router;
