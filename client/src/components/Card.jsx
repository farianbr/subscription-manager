import {
  MdBusiness,
  MdOutlineAccessTime,
  MdOutlinePayments,
} from "react-icons/md";
import { FaSackDollar } from "react-icons/fa6";
import { FaBuilding } from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";
import { MdCancel } from "react-icons/md";
import { Link } from "react-router-dom";
import { formatDate } from "../lib/utils";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  CANCEL_SUBSCRIPTION,
  UPDATE_TRANSACTION,
} from "../graphql/mutations/transaction.mutation";
import { useMutation, useQuery } from "@apollo/client/react";
import { GET_AUTHENTICATED_USER } from "../graphql/queries/user.queries";
import Modal from "./ui/Modal";

const categoryColorMap = {
  Productivity: "bg-emerald-50 border-emerald-200",
  Entertainment: "bg-pink-50 border-pink-200",
  Utilities: "bg-blue-50 border-blue-200",
  Education: "bg-amber-50 border-amber-200",
};

const categoryIconColor = {
  Productivity: "text-emerald-600",
  Entertainment: "text-pink-600",
  Utilities: "text-blue-600",
  Education: "text-amber-600",
};

const Card = ({ transaction }) => {
  let {
    _id,
    category,
    amount,
    provider,
    endDate,
    description,
    alertEnabled,
    companyLogo,
    billingCycle,
    renewalDate,
    paymentMethodId,
  } = transaction;

  const [showCancelModal, setShowCancelModal] = useState(false);
  const { data: userData } = useQuery(GET_AUTHENTICATED_USER);

  const [cancelSubscription, { loading: cancelLoading }] = useMutation(
    CANCEL_SUBSCRIPTION,
    {
      refetchQueries: ["GetTransactions", "GetTransactionStatistics"],
    }
  );

  const [updateTransaction, { loading: updateLoading }] =
    useMutation(UPDATE_TRANSACTION);

  // Get payment method name
  const paymentMethodName =
    userData?.authUser?.paymentMethods?.find(
      (method) => method.id === paymentMethodId
    )?.name || "Unknown";

  description = description[0]?.toUpperCase() + description.slice(1);
  category = category[0]?.toUpperCase() + category.slice(1);

  // Use renewalDate if available, otherwise fall back to endDate
  const displayDate = renewalDate || endDate;
  const formattedDate = formatDate(displayDate);

  const cardClass = categoryColorMap[category];
  const iconColor = categoryIconColor[category];

  const handleCancelRenewal = async () => {
    try {
      await cancelSubscription({
        variables: {
          transactionId: _id,
        },
      });
      toast.success("Subscription renewal canceled successfully");
      setShowCancelModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const handleToggle = async () => {
    try {
      await updateTransaction({
        variables: {
          input: {
            transactionId: _id,
            alertEnabled: !alertEnabled, // flip value
          },
        },
      });
      toast.success(
        `Alerts ${!alertEnabled ? "enabled" : "disabled"} for ${description}`
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update alert setting");
    }
  };

  return (
    <>
      <div className="group relative">
        <div
          className={`bg-white border-2 ${cardClass} rounded-lg p-5 hover:shadow-md transition-shadow duration-200`}
        >
          {/* Header with Company Logo */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3 flex-1">
              {/* Company Logo */}
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={provider || description}
                  className="w-10 h-10 rounded-lg object-contain bg-slate-50 p-1 border border-slate-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                  <span className="text-slate-500 text-lg font-bold">
                    {(provider || description).charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-0.5">
                  {provider || description}
                </h3>
                <p className="text-sm text-slate-500">{description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-2">
              <Link to={`/transaction/${_id}`}>
                <button
                  className="p-1.5 hover:bg-blue-50 rounded transition-colors duration-200"
                  title="Edit subscription"
                >
                  <HiPencilAlt
                    className="text-blue-500 hover:text-blue-600"
                    size={16}
                  />
                </button>
              </Link>
            </div>
          </div>

          {/* Amount - Primary Info */}
          <div className="mb-4 pb-4 border-b border-slate-200">
            <p className="text-sm text-slate-600 mb-1">
              {billingCycle
                ? `${
                    billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)
                  } Cost`
                : "Monthly Cost"}
            </p>
            <p className="text-2xl font-bold text-slate-900">
              ${amount.toFixed(2)}
            </p>
          </div>

          {/* Details Grid */}
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Renewal Date</span>
              <span className="font-medium text-slate-900">
                {formattedDate}
              </span>
            </div>

            {billingCycle && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Billing Cycle</span>
                <span className="font-medium text-slate-900 capitalize">
                  {billingCycle}
                </span>
              </div>
            )}

            {paymentMethodId && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Payment Method</span>
                <span className="font-medium text-slate-900">
                  {paymentMethodName}
                </span>
              </div>
            )}
            {category && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Category</span>
                <span
                  className={`font-medium ${iconColor || "text-slate-900"}`}
                >
                  {category}
                </span>
              </div>
            )}

            {/* Alert Toggle */}
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200">
              <span className="text-slate-600">Reminders</span>
              <button
                onClick={handleToggle}
                disabled={updateLoading}
                className="inline-flex items-center cursor-pointer"
              >
                {updateLoading ? (
                  <div className="w-10 h-5 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200
                      ${alertEnabled ? "bg-green-500" : "bg-slate-300"}
                      after:content-[''] after:absolute after:top-0.5 after:left-0.5
                      after:h-4 after:w-4 after:rounded-full after:bg-white
                      after:transition-all after:duration-200
                      ${
                        alertEnabled
                          ? "after:translate-x-5"
                          : "after:translate-x-0"
                      }
                    `}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Cancel Subscription Button - At Bottom */}
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={cancelLoading}
            className="w-full mt-4 flex items-center justify-center space-x-2 bg-orange-50 hover:bg-orange-100 text-orange-600 hover:text-orange-700 py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-orange-200"
          >
            <MdCancel size={18} />
            <span>Cancel Subscription</span>
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Subscription"
      >
        <div className="space-y-4">
          <p className="text-slate-700">
            Are you sure you want to cancel renewal for{" "}
            <strong>{provider || description}</strong>?
          </p>
          <p className="text-sm text-slate-600">
            This subscription will remain active until the renewal date (
            {formattedDate}). After that, it will not be renewed.
          </p>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setShowCancelModal(false)}
              disabled={cancelLoading}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors duration-200"
            >
              Keep Subscription
            </button>
            <button
              onClick={handleCancelRenewal}
              disabled={cancelLoading}
              className="flex-1 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {cancelLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-orange-200 border-t-white rounded-full animate-spin"></div>
                  <span>Canceling...</span>
                </>
              ) : (
                <span>Yes, Cancel Renewal</span>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
export default Card;
