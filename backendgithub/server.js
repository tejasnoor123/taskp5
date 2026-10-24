const express = require("express");
// cors middleware to allow requests from the React frontend running on port 5173
const cors = require("cors");
const dotenv = require("dotenv");
const sgMail = require("@sendgrid/mail");

dotenv.config();

const app = express();
const PORT = 3000;

// Enable Cross-Origin Resource Sharing (CORS) for frontend requests
app.use(cors());

// Set SendGrid API key from .env
//sgMail.setApikey used to configure the sendgrid mail and authenqticate the API key for sending emails.
sgMail.setApiKey(process.env.SENDGRID_API_KEY);



// Middleware to read JSON data
app.use(express.json());

// Serve frontend files
app.use(express.static(__dirname));

// Store subscribers temporarily
const subscribers = [];

// Subscribe endpoint
app.post("/subscribe", async (req, res) => {
    // Extract email from request body
    const { email } = req.body;

    // Check if email was provided
    if (!email || typeof email !== "string") {
        // Return 400 Bad Request status code for missing email
        return res.status(400).json({
            success: false,
            message: "Email address is required."
        });
    }

    // Normalize email by trimming whitespace and converting to lowercase
    const normalizedEmail = email.trim().toLowerCase();

    // Standard email validation pattern (RFC 5322 compliant regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate email format
    if (!emailRegex.test(normalizedEmail)) {
        // Return 400 Bad Request status code for invalid email syntax
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email address (e.g., name@example.com)."
        });
    }

    // Check if email already exists in subscribers list (prevent duplicates)
    if (subscribers.includes(normalizedEmail)) {
        // Return 409 Conflict status code for duplicate subscriber
        return res.status(409).json({
            success: false,
            message: "This email is already subscribed to the Daily Insider."
        });
    }

    // Add email to the subscriber list
    subscribers.push(normalizedEmail);

    // Create email message configuration for SendGrid
    const message = {
        to: normalizedEmail,
        from: process.env.FROM_EMAIL,
        subject: "Welcome to DEV@Deakin Daily Insider!",
        text: "Thank you for subscribing to our daily insider newsletter!",
        html: `
            <h2>Welcome to DEV@Deakin!</h2>
            <p>Thank you for subscribing to our Daily Insider newsletter.</p>
            <p>You have successfully joined our mailing list.</p>
        `
    };

    // Use try-catch block for robust error handling during asynchronous email sending
    try {
        // Asynchronously send welcome email via SendGrid
        const response = await sgMail.send(message);

        // Log successful email delivery to backend console
        console.log("Email sent successfully to:", normalizedEmail);
        console.log("SendGrid Status Code:", response[0].statusCode);

        // Return 201 Created status code with success message
        return res.status(201).json({
            success: true,
            message: `Successfully subscribed! A welcome email was sent to ${normalizedEmail}.`
        });

    } catch (error) {
        // Log detailed error information to backend console
        console.error("Email sending error:", error);

        // Roll back: remove the email from subscribers list if email sending failed
        const index = subscribers.indexOf(normalizedEmail);
        if (index !== -1) {
            subscribers.splice(index, 1);
        }

        // Extract detailed error message from SendGrid response if available
        const sendGridError = error?.response?.body?.errors?.[0]?.message;
        const failureReason = sendGridError || error.message || "Failed to send email.";

        // Return 500 Internal Server Error status code explaining why sending failed
        return res.status(500).json({
            success: false,
            message: `Subscription failed: ${failureReason}`
        });
    }
}); // End of /subscribe route


// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});