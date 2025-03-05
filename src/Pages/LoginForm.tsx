import z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { ChartNoAxesColumnDecreasing, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
const BASE_URL = "https://blueinvent.dockerserver.online";

const schema = z.object({
  username: z.string().min(1, "Invalid email address"),
  password: z.string().min(2, "Password must be at least 2 characters"),
});

interface LocationState {
  from?: {
    pathname: string;
  };
}
type FormFields = z.infer<typeof schema>;
export default function LoginForm() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({ resolver: zodResolver(schema) });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    const formattedData = new URLSearchParams();
    formattedData.append("username", data.username);
    formattedData.append("password", data.password);

    console.log(formattedData.toString()); // Logs the URL-encoded string

    try {
      const response = await axios.post(
        "https://blueinvent.dockerserver.online/login",
        formattedData,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      if (response.status === 200) {
        console.log("Login successful:", response.data);

        localStorage.setItem(
          "token",
          `${response.data.token_type} ${response.data.access_token}`
        );

        // Handle successful login (e.g., store token, redirect)
        const redirect =
          (location.state &&
            (location.state as LocationState)?.from?.pathname) ||
          "/";

        navigate(redirect);
      } else {
        throw new Error("Invalid credentials"); // Handle other response codes as needed
      }
    } catch (error) {
      setError("root", {
        message: "Invalid credentials", // Use "root" for global errors
      });
      console.error("Error fetching data:", error);
    }
  };

  return (
    <>
      <div className="h-full w-full">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full flex-col space-y-2"
        >
          <div className="flex flex-col space-y-1">
            <label className="text-stone-600" htmlFor="email ">
              Username
            </label>
            <input
              className="w-full px-2 py-1 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 transition"
              type="text"
              id="email"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-red-500 text-sm ">{errors.username.message}</p>
            )}
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-stone-600" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password")}
              className="w-full px-2 py-1 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {errors.password && (
              <p className="text-red-500 text-sm ">{errors.password.message}</p>
            )}
          </div>
          <div className="w-full mt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 w-full text-white p-2 rounded-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Login"
              )}
            </Button>
            {errors.root && (
              <p className="text-red-500 text-sm ">{errors.root.message}</p>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
