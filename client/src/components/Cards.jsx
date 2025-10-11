import { useQuery } from "@apollo/client/react";
import Card from "./Card";
import { GET_TRANSACTIONS } from "../graphql/queries/transaction.queries";
import CardsSkeletonList from "./CardsSkeletonList";

const Cards = ({ onAddNew }) => {
  const { data, loading, error } = useQuery(GET_TRANSACTIONS);

  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="w-full">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-start">
        {/* Add New Subscription Card - Always First */}
        <div 
          onClick={onAddNew}
          className="rounded-2xl p-6 shadow-lg cursor-pointer hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center min-h-[200px] group"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(255,255,255,0.02))', border: '1px solid rgba(59,130,246,0.06)', backdropFilter: 'blur(6px)'}}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-300/20 to-indigo-300/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2 text-slate-800">Add New Subscription</h3>
          <p className="text-slate-600 text-sm text-center">Track a new recurring expense</p>
        </div>

        {loading ? (
          <CardsSkeletonList count={6} />
        ) : data?.transactions.length > 0 ? (
          data.transactions.map((txn) => (
            <Card key={txn._id} transaction={txn} />
          ))
        ) : (
          <div className="col-span-2 flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-2xl font-bold text-slate-800 mb-2">No subscriptions yet</p>
            <p className="text-slate-600 text-center max-w-md">
              Click the "Add New Subscription" card to start tracking your recurring expenses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default Cards;
