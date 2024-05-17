import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import backgroundImage from "../../assets/queen-937501_1280.jpg";
import companyLogo from "../../assets/logo.png";
import { FaEnvelope, FaLock } from "react-icons/fa";

import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../features/userAuth";
import { userLogin } from "../../service/User/UserService";

const UserLogin = () => {
  const token = localStorage.getItem("userAccessToken");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  const validatePassword = (password) => {
    if (password.length < 6) {
      return false;
    }

    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const numberRegex = /[0-9]/;

    if (
      !uppercaseRegex.test(password) ||
      !lowercaseRegex.test(password) ||
      !symbolRegex.test(password) ||
      !numberRegex.test(password)
    ) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    if (!validateEmail(email)) {
      setErrors({
        email: "Invalid email address",
        password: "Password must be at least 6 characters long",
      });
      setTimeout(() => {
        setErrors({});
      }, 1000);
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setErrors({
        password:
          "Password must be at least 6 characters long and contain an uppercase letter, a lowercase letter, a symbol, and a number",
      });
      setTimeout(() => {
        setErrors({});
      }, 1000);
      setIsLoading(false);
      return;
    }

    try {
      const response = await userLogin(email, password);
      console.log("Response:==>", response);

      if (response.status === 200) {
        console.log("Inside status 200", response.data);
        dispatch(setUser(response.data.token));
        toast.success(response.data.msg);
        setTimeout(() => {
          navigate("/home");
        }, 1500);
      } else if (response.response.status === 401) {
        console.log("Haii", response.response.data.msg);
        toast.error(response.response.data.msg);
      } else if (response.response.status === 404) {
        console.log("Haii", response.response.data.msg);
        toast.error(response.response.data.msg);
      } else {
        toast.error("Some thing went wrong please try after some time");
      }
    } catch (error) {
      console.error("Axios error:", error);

      toast.error("An error occurred.");
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    }
  };

  if (token) return <Navigate to="/home" />;
  return (
    <div className="relative flex items-center justify-center min-h-screen">
      <img
        src={backgroundImage}
        alt="Background"
        className="absolute inset-0 object-cover w-full h-full"
      />
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <img src={companyLogo} alt="Company Logo" className="h-12 w-auto" />
        </div>
        <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600">
          User Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 font-semibold mb-2"
            >
              Email
            </label>
            <div className="relative">
              <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-gray-700 font-semibold mb-2"
            >
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your password"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 mt-1">{errors.password}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Verifying..." : "Login"}
          </button>
          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-sm">
              Dont have an account?{" "}
              <span
                onClick={() => navigate("/register")}
                className="text-indigo-600 hover:underline cursor-pointer"
              >
                Sign up
              </span>
            </p>
            <p
              onClick={() => navigate("/forgotpassword")}
              className="text-indigo-600 text-sm cursor-pointer hover:underline"
            >
              Forgot Password?
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;
