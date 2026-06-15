import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { VERIFY_EMAIL } from "../graphql/mutations/user.mutation";
import { GET_AUTHENTICATED_USER } from "../graphql/queries/user.queries";

const VerifyEmailPage = () => {
  const { token } = useParams();
  const client = useApolloClient();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");
  const ran = useRef(false);
  const [verifyEmail] = useMutation(VERIFY_EMAIL, {
    refetchQueries: [GET_AUTHENTICATED_USER],
  });

  useEffect(() => {
    if (ran.current) return; // guard against StrictMode double-invoke
    ran.current = true;

    // If the account is already verified (e.g. a concurrent/duplicate request
    // consumed the token first), treat that as success rather than an error.
    const isAlreadyVerified = async () => {
      try {
        const { data } = await client.query({
          query: GET_AUTHENTICATED_USER,
          fetchPolicy: "network-only",
        });
        return Boolean(data?.authUser?.emailVerified);
      } catch {
        return false;
      }
    };

    verifyEmail({ variables: { token } })
      .then(({ data }) => {
        setStatus("success");
        setMessage(data?.verifyEmail?.message || "Email verified.");
      })
      .catch(async (err) => {
        if (await isAlreadyVerified()) {
          setStatus("success");
          setMessage("Your email is already verified.");
          return;
        }
        setStatus("error");
        setMessage(err.message || "Verification failed.");
      });
  }, [token, verifyEmail, client]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-8 max-w-md w-full text-center">
        {status === "verifying" && (
          <>
            <div className="w-10 h-10 border-3 border-border border-t-accent rounded-full animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-foreground">Verifying your email…</h1>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
            <h1 className="text-xl font-semibold text-foreground mb-2">Email verified</h1>
            <p className="text-muted mb-6">{message}</p>
            <Link to="/" className="inline-block bg-accent hover:bg-accent-hover text-accent-fg px-6 py-2.5 rounded-lg font-medium">
              Go to dashboard
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 text-2xl">!</div>
            <h1 className="text-xl font-semibold text-foreground mb-2">Verification failed</h1>
            <p className="text-muted mb-6">{message}</p>
            <Link to="/" className="inline-block bg-surface-2 hover:bg-border text-foreground px-6 py-2.5 rounded-lg font-medium">
              Back to app
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
