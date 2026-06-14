import { useQuery, useMutation } from "@apollo/client/react";
import toast from "react-hot-toast";
import { GET_AUTHENTICATED_USER } from "../graphql/queries/user.queries";
import { RESEND_VERIFICATION } from "../graphql/mutations/user.mutation";

// Thin banner shown to authenticated users who haven't verified their email.
const VerificationBanner = () => {
  const { data } = useQuery(GET_AUTHENTICATED_USER);
  const [resend, { loading }] = useMutation(RESEND_VERIFICATION);

  const user = data?.authUser;
  if (!user || user.emailVerified) return null;

  const handleResend = async () => {
    try {
      const { data: res } = await resend();
      toast.success(res?.resendVerificationEmail?.message || "Verification email sent");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-3 text-sm">
        <span className="text-amber-800">
          Please verify your email to secure your account.
        </span>
        <button
          onClick={handleResend}
          disabled={loading}
          className="font-medium text-amber-900 underline hover:no-underline disabled:opacity-50"
        >
          {loading ? "Sending..." : "Resend email"}
        </button>
      </div>
    </div>
  );
};

export default VerificationBanner;
