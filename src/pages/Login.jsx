
// Import useState to store the email and password
import { useState } from "react";

// Import tools for page navigation and links uselocation is for information from signup
import { Link, useNavigate, useLocation } from "react-router-dom";

// Import Firebase login functions
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

// Import Firestore functions to save and check user details
import { doc, getDoc, setDoc } from "firebase/firestore";

// Import Firebase settings from our configuration file
import { auth, db, googleProvider } from "../firebase";


function Login() {
    // Store the email and password entered by the user
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Used to move the user to another page
    const navigate = useNavigate();

    // Get any message passed from the previous page
    const location = useLocation();
    const message = location.state?.message;

    // Save the user's details in localStorage
    const saveUser = (user) => {
        localStorage.setItem(
            "dev_deakin_user",
            JSON.stringify({
                name: user.displayName || user.email,
                email: user.email,
                photoURL: user.photoURL || ""
            })
        );
    };

    // Handle login with email and password
    const handleSubmit = async (e) => {
        e.preventDefault(); // Stop the page from refreshing

        try {
            // Check the email and password using Firebase Authentication
            const result = await signInWithEmailAndPassword(
                auth,
                email.trim().toLowerCase(),
                password
            );

            // Save the user's details and go to the home page
            saveUser(result.user);
            navigate("/");
        } catch (error) {
            // Print the error in the browser console if login fails
            console.log("Login failed", error);
        }
    };

    // Handle login using a Google account
    const handleGoogleSignIn = async () => {
        try {
            // Open the Google sign-in popup
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Find the user's document in the Firestore users collection
            const userRef = doc(db, "users", user.uid);
            const userData = await getDoc(userRef);

            // Create a document if the user is signing in for the first time
            if (!userData.exists()) {
                await setDoc(userRef, {
                    name: user.displayName || "",
                    email: user.email,
                    photoURL: user.photoURL || "",
                    createdAt: new Date().toISOString()
                });
            }

            // Save the user's details and go to the home page
            saveUser(user);
            navigate("/signup");
        } catch (error) {
            // Print the error if Google login fails
            console.log("Google login failed", error);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card login-card">
                <div className="auth-card-header">
                    {/* Link to the signup page */}
                    <Link to="/signup" className="auth-switch-btn">
                        Sign up
                    </Link>
                </div>

                {/* Show a success message if one was passed from another page */}
                {message && (
                    <div className="auth-alert success-alert">
                        {message}
                    </div>
                )}

                {/* Form for email and password login */}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="login-email">Your email</label>
                        <input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="login-password">Your password</label>
                        <input
                            id="login-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {/* Submit the form to log in */}
                    <button type="submit" className="auth-btn">
                        Login
                    </button>
                </form>

                {/* Separate email login from Google login */}
                <div className="auth-divider">
                    <span>or</span>
                </div>

                {/* Button for Google sign-in */}
                <button
                    type="button"
                    className="google-btn"
                    onClick={handleGoogleSignIn}
                >
                    Continue with Google
                </button>
            </div>
        </div>
    );
}

export default Login;
