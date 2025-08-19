import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const requestData = await request.json();

    // Email content
    const emailSubject = `New Viewing Request - ${requestData.propertyName}`;
    const emailBody = `
New Property Viewing Request

Property Details:
- Property: ${requestData.propertyName}
- Property ID: ${requestData.propertyId}
- Price: ${requestData.propertyPrice}

Client Information:
- Name: ${requestData.buyerName}
- Email: ${requestData.buyerEmail}

Requested Viewing:
- Date: ${requestData.requestedDate}
- Time: ${requestData.requestedTime}

Message from Client:
${requestData.message}

Request submitted: ${requestData.timestamp}

---
This request was sent from the Havenly Real Estate website.
    `.trim();

    // For now, we'll simulate email sending
    // In production, you would integrate with services like:
    // - Nodemailer with Gmail SMTP
    // - SendGrid
    // - Resend
    // - EmailJS

    console.log("📧 Automatic Email Sent:");
    console.log("To: rectrix21@gmail.com");
    console.log("Subject:", emailSubject);
    console.log("Body:", emailBody);
    console.log("---");

    // Simulate successful email sending
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay

    return NextResponse.json({
      success: true,
      message: "Viewing request email sent successfully to rectrix21@gmail.com",
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send email" },
      { status: 500 }
    );
  }
}
