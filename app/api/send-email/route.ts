import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const { email, teamName } = await request.json();

    const mailOptions = {
      from: {
        name: "Code Rush No-reply",
        address: process.env.GMAIL_USER,
      },
      to: email,
      subject: "Code Rush Registration Received",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px 0;">
            <img src="https://code-rush-one.vercel.app/cc-logo.png.jpg" alt="Coders Club Logo" style="width: 120px; margin-bottom: 15px;" />
          </div>
          <div style="background: #fff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h1 style="color: #2c5364; text-align: center;">Welcome to Code Rush!</h1>
            <p>Hi <b>${teamName}</b>,</p>
            <p>Your team has been <b>successfully registered</b> for Code Rush.</p>
            <p>Please wait for an admin to review and activate your registration. You will receive another email once your account is activated.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://code-rush-one.vercel.app/login" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #2c5364 0%, #203a43 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Go to Login</a>
            </div>
            <div style="background: #e3f2fd; padding: 18px; border-radius: 8px; margin: 24px 0 0 0; font-size: 15px;">
              <div style="color: #1976d2; font-size: 18px; font-weight: bold; margin-bottom: 10px;">Competition Mechanics</div>
              <ol style="margin-left: 18px; margin-bottom: 0;">
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
            <p style="color: #666; font-size: 13px;">If you have any questions, reply to this email or contact the organizers.</p>
            <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}