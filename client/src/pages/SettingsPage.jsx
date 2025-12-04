import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GET_AUTHENTICATED_USER } from "../graphql/queries/user.queries";
import { 
  UPDATE_PROFILE, 
  UPDATE_PASSWORD, 
  ADD_PAYMENT_METHOD, 
  REMOVE_PAYMENT_METHOD,
  SET_DEFAULT_PAYMENT_METHOD 
} from "../graphql/mutations/user.mutation";
import toast from "react-hot-toast";
import { useCurrency } from "../context/CurrencyContext";
import Modal from "../components/ui/Modal";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: userData, loading: userLoading } = useQuery(GET_AUTHENTICATED_USER);
  const { setCurrency: setGlobalCurrency } = useCurrency();
  
  const [updateProfile, { loading: profileLoading }] = useMutation(UPDATE_PROFILE);
  
  const [updatePassword, { loading: passwordLoading }] = useMutation(UPDATE_PASSWORD);
  
  const [addPaymentMethod, { loading: addingPayment }] = useMutation(ADD_PAYMENT_METHOD);
  
  const [removePaymentMethod] = useMutation(REMOVE_PAYMENT_METHOD);
  
  const [setDefaultPaymentMethod] = useMutation(SET_DEFAULT_PAYMENT_METHOD);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    currency: "USD",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [paymentData, setPaymentData] = useState({
    name: "",
    type: "card",
    last4: "",
    isDefault: false,
  });

  const [activeTab, setActiveTab] = useState("profile");
  const [settingDefaultId, setSettingDefaultId] = useState(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  // Initialize form with user data
  useEffect(() => {
    if (userData?.authUser) {
      setProfileData({
        name: userData.authUser.name || "",
        email: userData.authUser.email || "",
        currency: userData.authUser.currency || "USD",
      });
    }
  }, [userData]);

  // Check for tab parameter in URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["profile", "security", "payment"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        variables: { input: profileData },
        update: (cache, { data: updatedData }) => {
          if (updatedData?.updateProfile) {
            cache.writeQuery({
              query: GET_AUTHENTICATED_USER,
              data: { authUser: updatedData.updateProfile },
            });
          }
        },
      });
      // Update global currency context immediately
      setGlobalCurrency(profileData.currency);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await updatePassword({
        variables: {
          input: {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          },
        },
      });
      toast.success("Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      await addPaymentMethod({
        variables: { input: paymentData },
        update: (cache, { data: mutationData }) => {
          if (mutationData?.addPaymentMethod) {
            cache.writeQuery({
              query: GET_AUTHENTICATED_USER,
              data: { authUser: mutationData.addPaymentMethod },
            });
          }
        },
      });
      toast.success("Payment method added");
      setPaymentData({
        name: "",
        type: "card",
        last4: "",
        isDefault: false,
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRemovePayment = async (paymentMethodId) => {
    setPaymentToDelete(paymentMethodId);
    setDeleteModalOpen(true);
  };

  const confirmDeletePayment = async () => {
    if (!paymentToDelete) return;
    
    try {
      setDeletingPaymentId(paymentToDelete);
      await removePaymentMethod({
        variables: { paymentMethodId: paymentToDelete },
        update: (cache, { data: mutationData }) => {
          if (mutationData?.removePaymentMethod) {
            cache.writeQuery({
              query: GET_AUTHENTICATED_USER,
              data: { authUser: mutationData.removePaymentMethod },
            });
          }
        },
      });
      toast.success("Payment method removed");
      setDeleteModalOpen(false);
      setPaymentToDelete(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingPaymentId(null);
    }
  };

  const handleSetDefault = async (paymentMethodId) => {
    try {
      setSettingDefaultId(paymentMethodId);
      await setDefaultPaymentMethod({
        variables: { paymentMethodId },
        update: (cache, { data: mutationData }) => {
          if (mutationData?.setDefaultPaymentMethod) {
            cache.writeQuery({
              query: GET_AUTHENTICATED_USER,
              data: { authUser: mutationData.setDefaultPaymentMethod },
            });
          }
        },
      });
      toast.success("Default payment method updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSettingDefaultId(null);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "profile"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "security"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "payments"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                Payment Methods
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Currency
                  </label>
                  <select
                    value={profileData.currency}
                    onChange={(e) => setProfileData({ ...profileData, currency: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="BDT">BDT - Bangladeshi Taka</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  {profileLoading ? "Updating..." : "Update Profile"}
                </button>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}

            {/* Payment Methods Tab */}
            {activeTab === "payments" && (
              <div className="space-y-8">
                {/* Existing Payment Methods */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Payment Methods</h3>
                  {userData?.authUser?.paymentMethods?.length > 0 ? (
                    <div className="space-y-3">
                      {userData.authUser.paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{method.name}</p>
                              <p className="text-sm text-slate-500">
                                {method.type.toUpperCase()} {method.last4 && `•••• ${method.last4}`}
                              </p>
                            </div>
                            {method.isDefault && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {!method.isDefault && (
                              <button
                                onClick={() => handleSetDefault(method.id)}
                                disabled={settingDefaultId === method.id}
                                className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                              >
                                {settingDefaultId === method.id ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Setting...</span>
                                  </>
                                ) : (
                                  <span>Set Default</span>
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => handleRemovePayment(method.id)}
                              disabled={deletingPaymentId === method.id}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deletingPaymentId === method.id ? (
                                <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-8">No payment methods added yet</p>
                  )}
                </div>

                {/* Add New Payment Method */}
                <div className="border-t border-slate-200 pt-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Payment Method</h3>
                  <form onSubmit={handleAddPayment} className="space-y-4 max-w-xl">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Payment Method Name
                      </label>
                      <input
                        type="text"
                        value={paymentData.name}
                        onChange={(e) => setPaymentData({ ...paymentData, name: e.target.value })}
                        placeholder="e.g., Chase Visa, Cash Wallet"
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Type
                        </label>
                        <select
                          value={paymentData.type}
                          onChange={(e) => setPaymentData({ ...paymentData, type: e.target.value })}
                          className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="card">Card</option>
                          <option value="cash">Cash</option>
                          <option value="bkash">bKash</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Last 4 Digits (Optional)
                        </label>
                        <input
                          type="text"
                          value={paymentData.last4}
                          onChange={(e) => setPaymentData({ ...paymentData, last4: e.target.value.slice(0, 4) })}
                          placeholder="1234"
                          maxLength="4"
                          className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="setDefault"
                        checked={paymentData.isDefault}
                        onChange={(e) => setPaymentData({ ...paymentData, isDefault: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="setDefault" className="text-sm text-slate-700">
                        Set as default payment method
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={addingPayment}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                    >
                      {addingPayment ? "Adding..." : "Add Payment Method"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Delete Payment Method</h2>
          <p className="text-slate-600 mb-6">
            Are you sure you want to remove this payment method? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              disabled={deletingPaymentId !== null}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeletePayment}
              disabled={deletingPaymentId !== null}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {deletingPaymentId !== null ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete</span>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
