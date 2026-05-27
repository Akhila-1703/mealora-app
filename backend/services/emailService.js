import nodemailer from "nodemailer";
import { config } from "dotenv";

config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendMealDeliveredEmail = async (userEmail, userName) => {
  try {
    const info = await transporter.sendMail({
      from: `"Mealora Support" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: "Your Meal is Delivered! 🍱",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EBEBEB; border-radius: 12px;">
          <h2 style="color: #114232;">Hello ${userName},</h2>
          <p style="color: #333333; font-size: 16px; line-height: 1.5;">
            Your delicious meal has been freshly prepared and delivered to your selected address!
          </p>
          <p style="color: #333333; font-size: 16px; line-height: 1.5;">
            Enjoy your lunch, and have a wonderful day!
          </p>
          <hr style="border: none; border-top: 1px solid #EBEBEB; margin: 20px 0;" />
          <p style="color: #808080; font-size: 12px;">
            You are receiving this email because you opted in for email updates. 
            You can disable these notifications anytime from your Profile Account Settings.
          </p>
        </div>
      `,
    });
    console.log(`✅ Email sent to ${userEmail} [MessageId: ${info.messageId}]`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${userEmail}:`, error);
    return false;
  }
};
