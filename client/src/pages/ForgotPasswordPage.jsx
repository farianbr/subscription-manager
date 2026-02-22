import { Link } from "react-router-dom";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { FORGOT_PASSWORD } from "../graphql/mutations/user.mutation";
import InputField from "../components/InputField";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await forgotPassword({ variables: { email } });
      toast.success(data.forgotPassword.message);
      setSubmitted(true);
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
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password?</h1>
            <p className="text-slate-600 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-700 font-medium">Check your inbox</p>
              <p className="text-slate-500 text-sm">
                If <strong>{email}</strong> is registered, you'll receive a password reset email shortly. The link expires in 1 hour.
              </p>
              <Link
                to="/login"
                className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                ← Back to Login
              </Link>
            </div>
          ) : (
            <>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <InputField
                  label="Email Address"
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  Remember your password?{" "}
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                    Log in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
