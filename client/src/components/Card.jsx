import {
  MdBusiness,
  MdOutlineAccessTime,
  MdOutlinePayments,
} from "react-icons/md";
import { FaSackDollar } from "react-icons/fa6";
import { FaBuilding, FaTrash } from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";
import { Link } from "react-router-dom";
import { formatDate } from "../lib/utils";
import toast from "react-hot-toast";
import {
  DELETE_TRANSACTION,
  UPDATE_TRANSACTION,
} from "../graphql/mutations/transaction.mutation";
import { useMutation } from "@apollo/client/react";

const categoryColorMap = {
  Productivity: "from-emerald-500/10 to-green-500/5",
  Entertainment: "from-pink-500/10 to-rose-500/5", 
  Utilities: "from-blue-500/10 to-cyan-500/5",
  Education: "from-amber-500/10 to-yellow-500/5",
};

const Card = ({ transaction }) => {
  let {
    _id,
    category,
    amount,
    provider,
    endDate,
    paymentType,
    description,
    alertEnabled,
  } = transaction;
  const [deleteTransaction, { loading }] = useMutation(DELETE_TRANSACTION, {
    refetchQueries: ["GetTransactions", "GetTransactionStatistics"],
  });
  // const [updateTransaction] = useMutation(UPDATE_TRANSACTION, {
  //   refetchQueries: ["GetTransactions"],
  // });

  const [updateTransaction] = useMutation(UPDATE_TRANSACTION);

  description = description[0]?.toUpperCase() + description.slice(1);
  category = category[0]?.toUpperCase() + category.slice(1);
  paymentType = paymentType[0]?.toUpperCase() + paymentType.slice(1);

  const formattedDate = formatDate(endDate);

  const cardClass = categoryColorMap[category];

  const handleDelete = async () => {
    try {
      await deleteTransaction({
        variables: {
          transactionId: _id,
        },
      });
      toast.success("Subscription deleted successfully");
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
    <div className="group relative">
      <div className={`relative bg-white/70 backdrop-blur-sm bg-gradient-to-br ${cardClass} rounded-2xl p-6 border border-white/20 hover:border-slate-300 hover:shadow-xl transition-all duration-500 hover:scale-105`}>
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex flex-row items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">{description}</h2>
              <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-700">
                {category}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="w-5 h-5 border-t-2 border-b-2 border-slate-400 rounded-full animate-spin"></div>
              ) : (
                <button 
                  onClick={handleDelete}
                  className="p-2 bg-red-100 hover:bg-red-200 rounded-full transition-colors duration-300 group/delete"
                >
                  <FaTrash className="text-red-500 group-hover/delete:text-red-600 transition-colors duration-300" size={14} />
                </button>
              )}
              <Link to={`/transaction/${_id}`}>
                <button className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors duration-300 group/edit">
                  <HiPencilAlt className="text-blue-500 group-hover/edit:text-blue-600 transition-colors duration-300" size={16} />
                </button>
              </Link>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-slate-600">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaSackDollar className="text-green-600" size={14} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Amount</p>
                <p className="text-slate-800 font-semibold">${amount.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-600">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MdOutlineAccessTime className="text-blue-600" size={14} />
              </div>
              <div>
                <p className="text-sm text-slate-500">End Date</p>
                <p className="text-slate-800 font-semibold">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-600">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MdOutlinePayments className="text-purple-600" size={14} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Payment</p>
                <p className="text-slate-800 font-semibold">{paymentType}</p>
              </div>
            </div>

            {provider && (
              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MdBusiness className="text-orange-600" size={14} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Provider</p>
                  <p className="text-slate-800 font-semibold">{provider}</p>
                </div>
              </div>
            )}
          </div>

          {/* Alert Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600">🔔</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Reminder Alert</p>
                <p className="text-slate-800 font-semibold text-sm">
                  {alertEnabled ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>

            <label
              htmlFor={`alert-${_id}`}
              className="inline-flex items-center cursor-pointer"
            >
              <input
                id={`alert-${_id}`}
                type="checkbox"
                checked={alertEnabled}
                onChange={handleToggle}
                className="sr-only peer"
              />
              <div
                className={`
                  relative w-11 h-6 rounded-full transition-all duration-300
                  ${alertEnabled ? 'bg-green-500' : 'bg-slate-300'}
                  after:content-[''] after:absolute after:top-0.5 after:left-0.5
                  after:h-5 after:w-5 after:rounded-full after:bg-white
                  after:transition-all after:duration-300 after:shadow-md
                  ${alertEnabled ? 'after:translate-x-5' : 'after:translate-x-0'}
                `}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Card;
