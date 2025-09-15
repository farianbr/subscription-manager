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
  Productivity: "from-green-700 to-green-400",
  Entertainment: "from-pink-800 to-pink-600",
  Utilities: "from-blue-700 to-blue-400",
  Education: "from-yellow-500 to-yellow-300",
  // Add more categories and corresponding color classes as needed
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
    <div className={`rounded-md p-4 bg-gradient-to-br ${cardClass}`}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-bold text-white">{description}</h2>
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="w-6 h-6 border-t-2 border-b-2 rounded-full animate-spin"></div>
            ) : (
              <FaTrash className={"cursor-pointer"} onClick={handleDelete} />
            )}
            <Link to={`/transaction/${_id}`}>
              <HiPencilAlt className="cursor-pointer" size={20} />
            </Link>
          </div>
        </div>
        <p className="text-white flex items-center gap-1">
          <MdOutlineAccessTime />
          End Date: {formattedDate}
        </p>
        <p className="text-white flex items-center gap-1">
          <MdOutlinePayments />
          Payment Type: {paymentType}
        </p>
        <p className="text-white flex items-center gap-1">
          <FaSackDollar />
          Amount: ${amount}
        </p>
        <p className="text-white flex items-center gap-1">
          <MdBusiness />
          Service Provider: {provider || "N/A"}
        </p>
        <div className="flex justify-between items-center">
          <p className="text-xs text-black font-bold">{category}</p>
          {/* Toggle with label */}
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium">Alert</span>

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
        relative w-11 h-6 rounded-full transition-colors duration-300
        bg-gray-500 peer-checked:bg-green-500
        after:content-[''] after:absolute after:top-0.5 after:left-0.5
        after:h-5 after:w-5 after:rounded-full after:bg-white
        after:transition-all after:duration-300
        peer-checked:after:translate-x-5
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
