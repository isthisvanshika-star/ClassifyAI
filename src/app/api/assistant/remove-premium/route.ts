// /api/admin/remove-premium/route.ts
import { logActivity } from "@/lib/helper";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { userId, reason } = await req.json();

  if (!userId || !reason) {
    return NextResponse.json(
      { error: "User ID and reason are required" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    await prisma.user.update({
      where: { id: userId },
      data: {
        premiumExpiresAt: null,
        premiumFeatures: {
          set: [],
        },
      },
    });

    // setup mail transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"ClassifyAI" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Your Premium Plan has been Cancelled",
      html: `
        <html>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
            <table role="presentation" cellspacing="0" cellpadding="0" width="100%">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="background-color: #0ea5e9; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                        <h1 style="margin: 0; font-size: 24px; color: white; letter-spacing: 1px;">Classify<span style="font-weight: 300;">AI</span></h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 30px;">
                        <p style="font-size: 16px; color: #111827; margin: 0 0 16px;">
                          Dear <strong>${user.name}</strong>,
                        </p>
                        <p style="font-size: 16px; color: #374151; margin: 0 0 16px;">
                          We wanted to let you know that your premium plan has been <strong style="color: #dc2626;">cancelled</strong> by our admin team.
                        </p>
                        <p style="font-size: 16px; color: #374151; margin: 0 0 16px;">
                          <strong>Reason:</strong> <span style="color: #0f172a;">${reason}</span>
                        </p>
                        <p style="font-size: 16px; color: #374151; margin: 0 0 16px;">
                          If you have any questions or believe this was a mistake, please don’t hesitate to reach out to our support team. We’re here to help!
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/support" 
                            style="background-color: #0ea5e9; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-size: 16px;">
                            Contact Support
                          </a>
                        </div>
                        <p style="font-size: 14px; color: #9ca3af; text-align: center; margin-top: 20px;">
                          — The ClassifyAI Team
                        </p>
                      </td>
                    </tr>
                  </table>
                  <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
                    © ${new Date().getFullYear()} ClassifyAI. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    await logActivity(
      userId,
      user.name,
      `Removed premium by ClassifyAI-admin. Reason: ${reason}`
    );

    return NextResponse.json({
      success: true,
      message: "Premium features removed and email sent",
    });
  } catch (error) {
    console.error("Failed to remove premium:", error);
    return NextResponse.json(
      { error: "Failed to remove premium" },
      { status: 500 }
    );
  }
}
