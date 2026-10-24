// Import useState hook to manage component state
import { useState } from "react";

function Newsletter() {
    // State to store the email entered by the user
    const [email, setEmail] = useState("");

    // State to track whether an HTTP request is currently being processed
    const [loading, setLoading] = useState(false);

    // State to store alert outcome: status type ('success' | 'error'), status code, and detailed message
    const [alert, setAlert] = useState({ type: "", statusCode: null, message: "" });

    // Client-side regex for validating email format before sending HTTP request
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Function to handle form submission and manage HTTP request lifecycle
    const handleSubscribe = async (e) => {
        // Prevent default browser form reload
        e.preventDefault();

        // Reset previous alert message
        setAlert({ type: "", statusCode: null, message: "" });

        // Clean user input by trimming whitespace
        const cleanEmail = email.trim();

        // Client-side validation: Check for empty input
        if (!cleanEmail) {
            setAlert({
                type: "error",
                statusCode: 400,
                message: "Validation Error: Email address cannot be empty."
            });
            return;
        }

        // Client-side validation: Validate email format using regex pattern
        if (!emailRegex.test(cleanEmail)) {
            setAlert({
                type: "error",
                statusCode: 400,
                message: "Validation Error: Please enter a valid email address (e.g., user@example.com)."
            });
            return;
        }

        // Set loading state to true to disable submit button and show loading text
        setLoading(true);

        // Try-catch block for handling asynchronous HTTP request and potential network errors
        try {
            // Send POST request with JSON payload to Express backend endpoint
            const response = await fetch("http://localhost:3000/subscribe", {
                method: "POST",
                headers: {
                    // Inform backend that payload is JSON formatted
                    "Content-Type": "application/json"
                },
                // Serialize trimmed email data into JSON string
                body: JSON.stringify({ email: cleanEmail })
            });

            // Parse JSON response body received from the server
            const data = await response.json();

            // Handle HTTP 201 Created (Success)
            if (response.status === 201) {
                setAlert({
                    type: "success",
                    statusCode: 201,
                    message: data.message || "Success! Welcome email sent to your inbox."
                });
                // Clear the input field upon successful subscription
                setEmail("");
            } 
            // Handle HTTP 400 Bad Request (Validation failure from backend)
            else if (response.status === 400) {
                setAlert({
                    type: "error",
                    statusCode: 400,
                    message: `Validation Failed (400): ${data.message || "Invalid email format."}`
                });
            } 
            // Handle HTTP 409 Conflict (Duplicate subscription)
            else if (response.status === 409) {
                setAlert({
                    type: "error",
                    statusCode: 409,
                    message: `Already Subscribed (409): ${data.message || "This email is already on our list."}`
                });
            } 
            // Handle HTTP 500 Internal Server Error (e.g., SendGrid delivery failure)
            else if (response.status === 500) {
                setAlert({
                    type: "error",
                    statusCode: 500,
                    message: `Server Error (500): ${data.message || "Failed to deliver welcome email. Please try again later."}`
                });
            } 
            // Fallback for any other unexpected HTTP status codes
            else {
                setAlert({
                    type: "error",
                    statusCode: response.status,
                    message: `Request Failed (${response.status}): ${data.message || "An unexpected error occurred."}`
                });
            }

        } catch (error) {
            // Catch network errors (e.g., backend server not running, connection refused)
            console.error("HTTP Request Error:", error);

            // Inform user that the HTTP request failed because the server could not be reached
            setAlert({
                type: "error",
                statusCode: 0,
                message: "Connection Failed: Could not reach the backend server. Please verify that server.js is running on port 3000."
            });

        } finally {
            // Always reset loading state whether the request succeeded or failed
            setLoading(false);
        }
    };

    return (
        <section className="newsletter" id="contact">
            <div className="newsletter-container">
                <h2>
                    SIGN UP FOR OUR DAILY INSIDER
                </h2>

                <div className="newsletter-form-wrapper">
                    {/* Newsletter subscription form */}
                    <form className="newsletter-form" onSubmit={handleSubscribe}>
                        {/* Email input field bound to component state */}
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />

                        {/* Submit button with dynamic loading text */}
                        <button type="submit" disabled={loading}>
                            {loading ? "Subscribing..." : "Subscribe"}
                        </button>
                    </form>

                    {/* Alert banner displaying outcome (Success/Fail) and reason */}
                    {alert.message && (
                        <div className={`newsletter-alert ${alert.type}`} role="alert">
                            <span className="newsletter-alert-icon">
                                </span>
                            <span className="newsletter-alert-text">
                                {alert.message}
                            </span>
                            {/* Dismiss button to clear alert */}
                            <button
                                type="button"
                                className="newsletter-alert-close"
                                onClick={() => setAlert({ type: "", statusCode: null, message: "" })}
                                aria-label="Dismiss alert"
                            >
                                ×
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
export default Newsletter;