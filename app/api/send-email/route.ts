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
      subject: "Code Rush Registration Received",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              padding: 20px 0;
              background: linear-gradient(135deg, #232526 0%, #0f2027 100%);
              border-radius: 10px 10px 0 0;
            }
            .logo {
              width: 120px;
              height: auto;
              margin-bottom: 15px;
            }
            .content {
              background: #ffffff;
              padding: 30px;
              border-radius: 0 0 10px 10px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .title {
              color: #2c5364;
              font-size: 24px;
              margin-bottom: 20px;
              text-align: center;
            }
            .message {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
            }
            .highlight {
              color: #2c5364;
              font-weight: bold;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: linear-gradient(135deg, #2c5364 0%, #203a43 100%);
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
              font-size: 16px;
            }
            .mechanics {
              background: #e3f2fd;
              padding: 18px;
              border-radius: 8px;
              margin: 24px 0 0 0;
              font-size: 15px;
            }
            .mechanics-title {
              color: #1976d2;
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .mechanics-list {
              margin-left: 18px;
              margin-bottom: 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="cid:cc-logo" alt="Coders Club Logo" class="logo">
          </div>
          <div class="content">
            <h1 class="title">Welcome to Code Rush!</h1>
            <div class="message">
              <h2>Hi ${teamName}! 👋</h2>
              <p>Your team has been <span class="highlight">successfully registered</span> for Code Rush.</p>
              <p>We're excited to have you join us in this coding competition!</p>
            </div>
            <div class="message">
              <h3>What's Next?</h3>
              <p>Please wait for an admin to review and activate your registration. You will receive another email once your account is activated.</p>
              <p>Once the competition starts, you can log in using the button below:</p>
              <a href="https://coderush.vercel.app/login" class="button">Go to Login</a>
              <p style="font-size:13px;color:#888;margin-top:8px;">(The login will be active once the competition begins.)</p>
            </div>
            <div class="mechanics">
              <div class="mechanics-title">Competition Mechanics</div>
              <ol class="mechanics-list">
                <li>The competition consists of <b>three levels: Easy, Medium, and Hard</b>.</li>
                <li>Each level will have <b>three coding questions</b> that test logic, problem-solving, and programming skills.</li>
                <li>Participants must compete in <b>teams of three members</b>.</li>
                <li>Only <b>SHS ITMAWD students and 1st to 3rd Year IT students</b> are eligible to join the competition.</li>
                <li><b>Easy Round:</b>
                  <ol>
                    <li>Each question has a <b>30-minute time limit</b>.</li>
                    <li>Participants who complete the first question within 30 minutes move to the second question, then continue in the same manner until the third question of the Easy level.</li>
                  </ol>
                </li>
                <li><b>Medium Round:</b>
                  <ol>
                    <li>Each question has a <b>15-minute time limit</b>.</li>
                  </ol>
                </li>
                <li><b>Hard Round:</b>
                  <ul>
                    <li>The first two questions have a <b>10-minute time limit each</b>.</li>
                    <li>The final question has a <b>5-minute time limit</b>.</li>
                  </ul>
                </li>
              </ol>
            </div>
            <div class="footer">
              <p>Thank you for participating!</p>
              <p><strong>Code Rush Team</strong></p>
              <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
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
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
} 