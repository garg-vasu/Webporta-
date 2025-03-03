import axios from "axios";
import { Loader2 } from "lucide-react";
import { PropsWithChildren, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://running-corrine-studenttt702-a4e108db.koyeb.app"; // Replace with actual API URL

export default function PrivateRoute({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  ); // Store token in state

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const validateToken = async () => {
        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        try {
          const response = await axios.get(`${BASE_URL}/users/me`, {
            headers: {
              Authorization: token, // Ensure proper token format
            },
          });

          if (response.data && response.data.id) {
            setIsLoading(false);
          } else {
            console.warn("Invalid token response:", response.data);
            localStorage.removeItem("token");
            navigate("/login", { replace: true });
          }
        } catch (error) {
          console.error(
            "Token validation error:",
            error.response?.data || error
          );
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            navigate("/login", { replace: true });
          }
        }
      };

      validateToken();

      const intervalId = setInterval(validateToken, 120000); // Revalidate every 2 mins

      return () => clearInterval(intervalId);
    }, 1000); // 10-second delay (10,000 ms)

    return () => clearTimeout(timeoutId);
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
