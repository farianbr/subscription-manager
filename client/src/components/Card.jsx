import { HiPencilAlt } from "react-icons/hi";
import { MdCancel } from "react-icons/md";
import { formatDate } from "../lib/utils";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  DELETE_SUBSCRIPTION,
  UPDATE_SUBSCRIPTION,
} from "../graphql/mutations/subscription.mutation";
import { useMutation, useQuery } from "@apollo/client/react";
import { GET_AUTHENTICATED_USER } from "../graphql/queries/user.queries";
import Modal from "./ui/Modal";
import { useCurrency } from "../context/CurrencyContext";
import EditSubscriptionForm from "./EditSubscriptionForm";
import { getCompanyLogo } from "../lib/companyLogos";

const categoryIconColor = {
  Productivity: "text-emerald-500",
  Entertainment: "text-pink-500",
  Utilities: "text-sky-500",
  Education: "text-amber-500",
};

const Card = ({ subscription }) => {
  let {
    _id,
    category,
    costInDollar,
    provider,
    nextBillingDate,
    serviceName,
    alertEnabled,
    billingCycle,
    paymentMethodId,
  } = subscription;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { data: userData } = useQuery(GET_AUTHENTICATED_USER);
  const { formatCurrency } = useCurrency();

  const [deleteSubscription, { loading: deleteLoading }] = useMutation(
    DELETE_SUBSCRIPTION,
    {
      refetchQueries: ["GetSubscriptions", "GetMonthlyHistory"],
    }
  );

  const [updateSubscription, { loading: updateLoading }] = useMutation(
    UPDATE_SUBSCRIPTION,
    {
      refetchQueries: ["GetSubscriptions", "GetMonthlyHistory"],
    }
  );

  // Get payment method name
  const paymentMethodName =
    userData?.authUser?.paymentMethods?.find(
      (method) => method.id === paymentMethodId
    )?.name || "Unknown";

  serviceName = serviceName[0]?.toUpperCase() + serviceName.slice(1);
  category = category[0]?.toUpperCase() + category.slice(1);
  
  const companyLogo = getCompanyLogo(provider);

  // Use nextBillingDate for display
  const formattedDate = formatDate(nextBillingDate);

  const iconColor = categoryIconColor[category];

  const handleDeleteSubscription = async () => {
    try {
      await deleteSubscription({
        variables: {
          subscriptionId: _id,
        },
      });
      toast.success("Subscription deleted successfully");
      setShowDeleteModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const handleToggle = async () => {
    try {
      await updateSubscription({
        variables: {
          input: {
            subscriptionId: _id,
            alertEnabled: !alertEnabled, // flip value
          },
        },
      });
      toast.success(
        `Alerts ${!alertEnabled ? "enabled" : "disabled"} for ${serviceName}`
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update alert setting");
    }
  };

  return (
    <>
      <div className="group relative">
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 hover:shadow-lg hover:shadow-black/[0.03] transition-shadow duration-200">
          {/* Header with Company Logo */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3 flex-1">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={serviceName}
                  className="w-11 h-11 rounded-xl object-contain bg-surface-2 p-1.5 border border-border"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-surface-2 flex items-center justify-center border border-border">
                  <span className="text-muted text-lg font-semibold">
                    {serviceName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-[17px] font-semibold tracking-tight text-foreground mb-0.5">
                  {serviceName}
                </h3>
                <p className="text-sm text-muted capitalize">{provider}</p>
              </div>
            </div>

            <button
              onClick={() => setShowEditModal(true)}
              className="p-1.5 text-muted hover:text-accent hover:bg-surface-2 rounded-lg transition-colors duration-200"
              title="Edit subscription"
            >
              <HiPencilAlt size={16} />
            </button>
          </div>

          {/* Amount - Primary Info */}
          <div className="mb-4 pb-4 border-b border-border">
            <p className="text-sm text-muted mb-1">
              {billingCycle
                ? `${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)} Cost`
                : "Monthly Cost"}
            </p>
            <p className="text-2xl sm:text-[28px] leading-tight font-semibold tracking-tight text-foreground">
              {formatCurrency(costInDollar)}
            </p>
          </div>

          {/* Details Grid */}
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Renewal Date</span>
              <span className="font-medium text-foreground">{formattedDate}</span>
            </div>

            {billingCycle && (
              <div className="flex items-center justify-between">
                <span className="text-muted">Billing Cycle</span>
                <span className="font-medium text-foreground capitalize">{billingCycle}</span>
              </div>
            )}

            {paymentMethodId && (
              <div className="flex items-center justify-between">
                <span className="text-muted">Payment Method</span>
                <span className="font-medium text-foreground capitalize">{paymentMethodName}</span>
              </div>
            )}
            {category && (
              <div className="flex items-center justify-between">
                <span className="text-muted">Category</span>
                <span className={`font-medium ${iconColor || "text-foreground"}`}>{category}</span>
              </div>
            )}

            {/* Alert Toggle */}
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-border">
              <span className="text-muted">Reminders</span>
              <button
                onClick={handleToggle}
                disabled={updateLoading}
                className="inline-flex items-center cursor-pointer"
                aria-label="Toggle reminders"
              >
                {updateLoading ? (
                  <div className="w-10 h-5 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-border border-t-muted rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200
                      ${alertEnabled ? "bg-green-500" : "bg-border"}
                      after:content-[''] after:absolute after:top-0.5 after:left-0.5
                      after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow
                      after:transition-all after:duration-200
                      ${alertEnabled ? "after:translate-x-5" : "after:translate-x-0"}
                    `}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Delete Subscription Button */}
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={deleteLoading}
            className="w-full mt-4 flex items-center justify-center space-x-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 py-2.5 px-4 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdCancel size={18} />
            <span>Delete Subscription</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Subscription"
      >
        <div className="space-y-4">
          <p className="text-foreground">
            Are you sure you want to delete{" "}
            <strong>{serviceName}</strong> from {provider}?
          </p>
          <p className="text-sm text-muted">
            This will permanently remove this subscription from your tracking. This action cannot be undone.
          </p>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteLoading}
              className="flex-1 px-4 py-2.5 bg-surface-2 hover:bg-border text-foreground rounded-xl font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSubscription}
              disabled={deleteLoading}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {deleteLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-200 border-t-white rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Yes, Delete</span>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Subscription Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        <div className="p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-6">Edit Subscription</h2>
          <EditSubscriptionForm 
            subscription={subscription}
            onSuccess={() => setShowEditModal(false)}
            onCancel={() => setShowEditModal(false)}
          />
        </div>
      </Modal>
    </>
  );
};
export default Card;
