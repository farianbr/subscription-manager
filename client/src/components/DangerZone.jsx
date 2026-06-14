import { useState } from "react";
import { useMutation, useApolloClient } from "@apollo/client/react";
import toast from "react-hot-toast";
import { DELETE_ACCOUNT } from "../graphql/mutations/user.mutation";
import Modal from "./ui/Modal";

const DangerZone = () => {
  const client = useApolloClient();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteAccount, { loading }] = useMutation(DELETE_ACCOUNT);

  const handleDelete = async () => {
    try {
      await deleteAccount({ variables: { password } });
      toast.success("Account deleted");
      // Clear cached user; App will redirect to /login once authUser is null.
      await client.resetStore();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="border-t border-slate-200 pt-8">
      <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
      <p className="text-sm text-slate-600 mb-4">
        Deleting your account permanently removes your profile, subscriptions, and transaction history. This cannot be undone.
      </p>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium text-sm transition-colors"
      >
        Delete Account
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Delete Account">
        <div className="space-y-4">
          <p className="text-slate-700 text-sm">
            This is permanent. Enter your password to confirm.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setOpen(false)}
              disabled={loading}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || !password}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete forever"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DangerZone;
