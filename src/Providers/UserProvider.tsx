import axios, { AxiosError } from "axios";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
const BASE_URL = "https://blueinvent.dockerserver.online"; // Replace with actual API URL
// Interfaces
export interface User {
  name: "string";
  role: number[];
  email: "string";
  id: number;
  username: "string";
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

interface UserProviderProps {
  children: ReactNode;
}

// Utility function to handle errors
const getErrorMessage = (error: AxiosError | unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      return "Unauthorized. Please log in.";
    }
    if (error.response?.status === 403) {
      return "Access denied. Please contact your administrator.";
    }
    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please try again later.";
    }
    return error.response?.data?.message || "Failed to fetch user data.";
  }
  return "An unexpected error occurred.";
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get<User>(`${BASE_URL}/users/me`, {
          headers: { Authorization: token },
        });
        if (response.data.name) {
          setUser(response.data);
          setError(null);
        } else {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
        }
      } catch (error) {
        const message = getErrorMessage(error);
        setError(message);
        setUser(null);
        if (message.includes("Unauthorized")) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
