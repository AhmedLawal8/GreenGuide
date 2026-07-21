import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Handles the redirect from the Google OAuth callback.
 * Extracts the JWT from the query string, stores it, and navigates home.
 */
export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { setTokenFromCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setTokenFromCallback(token).then(() => navigate("/", { replace: true }));
    } else {
      // No token — send back to login
      navigate("/login", { replace: true });
    }
  }, [searchParams, setTokenFromCallback, navigate]);

  return null;
}
