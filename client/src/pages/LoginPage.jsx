import { Link } from "react-router-dom";
import {  useState } from "react";
import InputField from "../components/InputField";
import { useMutation } from "@apollo/client/react";
import { LOGIN } from "../graphql/mutations/user.mutation";
import { GET_AUTHENTICATED_USER } from "../graphql/queries/user.queries";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: "demo@subscriptionmanager.com",
    password: "demo1234",
  });

  const [login, { loading }] = useMutation(LOGIN, {
    refetchQueries: ["GET_AUTHENTICATED_USER"],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login({
        variables: {
          input: loginData,
        },
      });
      toast.success(`Welcome ${data.login.name}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };


  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
              Welcome Back
            </h1>
            <p className="text-muted">
              Log in to manage your subscriptions
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <InputField
              label="Email"
              id="email"
              name="email"
              type="email"
              value={loginData.email}
              onChange={handleChange}
            />

            <InputField
              label="Password"
              id="password"
              name="password"
              type="password"
              value={loginData.password}
              onChange={handleChange}
            />

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-accent hover:opacity-80 font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-hover text-accent-fg py-3 px-4 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              Don't have an account?{" "}
              <Link to="/signup" className="text-accent hover:opacity-80 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          <Link to="/privacy" className="hover:text-foreground hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};
export default LoginPage;
