import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { name, email, phone, message, propertyId, propertyTitle, propertyAddress } =
    await req.json();

  if (!name || !email || !propertyId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // 1 — Save lead to DB
  const lead = await prisma.lead.create({
    data: { name, email, phone: phone || null, message: message || null, propertyId },
  });

  // 2 — Send notification email to info@shulsearch.com
  if (process.env.RESEND_API_KEY) {
    await resend.emails.send({
      from: "ShulSearch <notifications@shulsearch.com>",
      to: "info@shulsearch.com",
      replyTo: email,
      subject: `New inquiry: ${propertyTitle}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#1e3a5f">New Lead from ShulSearch</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;color:#64748b;width:100px">Name</td><td style="padding:8px;font-weight:600">${name}</td></tr>
            <tr style="background:#f8fafc"><td style="padding:8px;color:#64748b">Email</td><td style="padding:8px"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px;color:#64748b">Phone</td><td style="padding:8px">${phone || "—"}</td></tr>
            <tr style="background:#f8fafc"><td style="padding:8px;color:#64748b">Property</td><td style="padding:8px">${propertyTitle}</td></tr>
            <tr><td style="padding:8px;color:#64748b">Address</td><td style="padding:8px">${propertyAddress}</td></tr>
            ${message ? `<tr style="background:#f8fafc"><td style="padding:8px;color:#64748b;vertical-align:top">Message</td><td style="padding:8px">${message}</td></tr>` : ""}
          </table>
          <div style="margin-top:24px">
            <a href="https://www.shulsearch.com/property/${propertyId}"
               style="background:#2563eb;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
              View Listing →
            </a>
          </div>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">ShulSearch · info@shulsearch.com</p>
        </div>
      `,
    });

    // 3 — Send confirmation email to the buyer
    await resend.emails.send({
      from: "ShulSearch <info@shulsearch.com>",
      to: email,
      subject: `We received your inquiry for ${propertyTitle}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#1e3a5f">Thanks for reaching out, ${name}!</h2>
          <p style="color:#475569">We've received your inquiry for:</p>
          <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0">
            <div style="font-weight:700;color:#0f172a">${propertyTitle}</div>
            <div style="color:#64748b;font-size:14px">${propertyAddress}</div>
          </div>
          <p style="color:#475569">Someone from our team will be in touch with you shortly at <strong>${email}</strong>.</p>
          <div style="margin-top:24px">
            <a href="https://www.shulsearch.com/property/${propertyId}"
               style="background:#2563eb;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
              View Listing →
            </a>
          </div>
          <p style="color:#94a3b8;font-size:12px;margin-top:32px">
            ShulSearch · <a href="https://www.shulsearch.com" style="color:#94a3b8">shulsearch.com</a>
          </p>
        </div>
      `,
    });
  }

  return NextResponse.json({ ok: true, leadId: lead.id });
}
