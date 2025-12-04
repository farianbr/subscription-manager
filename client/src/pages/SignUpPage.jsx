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
  const navigate = useNavigate();
  const [signUp, { loading }] = useMutation(SIGN_UP, {
    refetchQueries: [{ query: GET_AUTHENTICATED_USER }],
  });

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
          "Signup successful! Welcome to Subscription Manager.",
          { duration: 4000 }
        );

        // redirect to home page (user is now logged in)
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Create Account
            </h1>
            <p className="text-slate-600">
              Start tracking your subscriptions today
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Gender
              </label>
              <div className="flex gap-6">
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
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
