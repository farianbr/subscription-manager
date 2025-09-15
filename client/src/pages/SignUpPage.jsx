import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RadioButton from "../components/RadioButton";
import InputField from "../components/InputField";
import { SIGN_UP } from "../graphql/mutations/user.mutation";
import { useMutation } from "@apollo/client/react";
import toast from "react-hot-toast";
import { GET_AUTHENTICATED_USER } from "../graphql/queries/user.queries";

const SignUpPage = () => {
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
  });
  // const navigate = useNavigate()
  const [signUp, { loading, error }] = useMutation(SIGN_UP, {
    refetchQueries: ["GET_AUTHENTICATED_USER"],
  });
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (type === "radio") {
      setSignUpData((prevData) => ({
        ...prevData,
        gender: value,
      }));
    } else {
      setSignUpData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailRegex.test(signUpData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      const { data } = await signUp({
        variables: { input: signUpData },
      });

      if (data?.signUp) {
        // show a success toast
        toast.success(
          "Signup successful! Please verify your email before logging in."
        );

        // redirect to login page
        navigate("/login");
      }
    } catch (err) {
      let errorMessage =
        err?.graphQLErrors?.[0]?.message ||
        err?.networkError?.message ||
        err?.message ||
        "Something went wrong";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="flex rounded-lg overflow-hidden z-50 bg-gray-300">
        <div className="w-full bg-gray-100 min-w-80 sm:min-w-96 flex items-center justify-center">
          <div className="max-w-md w-full p-6">
            <h1 className="text-3xl font-semibold mb-6 text-black text-center">
              Sign Up
            </h1>
            <h1 className="text-sm font-semibold mb-6 text-gray-500 text-center">
              Join to manage your subscriptions
            </h1>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <InputField
                label="Full Name"
                id="name"
                name="name"
                value={signUpData.name}
                onChange={handleChange}
              />
              <InputField
                label="Email"
                id="email"
                name="email"
                type="email"
                value={signUpData.email}
                onChange={handleChange}
              />

              <InputField
                label="Password"
                id="password"
                name="password"
                type="password"
                value={signUpData.password}
                onChange={handleChange}
              />
              <div className="flex gap-10">
                <RadioButton
                  id="male"
                  label="Male"
                  name="gender"
                  value="male"
                  onChange={handleChange}
                  checked={signUpData.gender === "male"}
                />
                <RadioButton
                  id="female"
                  label="Female"
                  name="gender"
                  value="female"
                  onChange={handleChange}
                  checked={signUpData.gender === "female"}
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:bg-black  focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Sign Up"}
                </button>
                <p className="text-red-500 text-center text-sm">{error}</p>
              </div>
            </form>
            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="text-black hover:underline">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
