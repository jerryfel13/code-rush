import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "yourfel13@gmail.com",
    pass: "lrtx sust rbmo nrpz",
  },
});

export async function POST(request: Request) {
  try {
    const { email, teamName } = await request.json();

    const mailOptions = {
      from: {
        name: "Code Rush No-reply",
        address: "yourfel13@gmail.com"
      },
      to: email,
      subject: "Code Rush Registration Activated",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px 0;">
            <img src="cid:cc-logo" alt="Coders Club Logo" style="width: 120px; margin-bottom: 15px;" />
          </div>
          <div style="background: #fff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h1 style="color: #2c5364; text-align: center;">Your Registration is Confirmed!</h1>
            <p>Hi <b>${teamName}</b>,</p>
            <p>Your team's registration for <b>Code Rush</b> has been <span style="color: #388e3c; font-weight: bold;">activated</span> by the admin. You can now log in and participate in the competition!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://code-rush-one.vercel.app/login" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #2c5364 0%, #203a43 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Go to Login</a>
            </div>
            <p style="color: #666; font-size: 13px;">If you have any questions, reply to this email or contact the organizers.</p>
            <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'cc-logo.png.jpg',
          path: process.cwd() + '/public/cc-logo.png.jpg',
          cid: 'cc-logo'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending activation email:', error);
    return NextResponse.json({ error: 'Failed to send activation email' }, { status: 500 });
  }
} 