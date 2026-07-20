const sendEmail = async ({ to, subject, html }) => {
  // Email feature coming soon — App Password needed for Gmail
  console.log("=== EMAIL ===");
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  if (html) {
    // Extract OTP from html if present
    const otpMatch = html.match(/\b\d{6}\b/);
    if (otpMatch) {
      console.log(`OTP: ${otpMatch[0]}`);
    }
  }
  console.log("=============");
};

export default sendEmail;