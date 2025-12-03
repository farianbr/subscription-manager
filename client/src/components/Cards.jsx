import { useQuery } from "@apollo/client/react";
import Card from "./Card";
import { GET_SUBSCRIPTIONS } from "../graphql/queries/subscription.queries";
import CardsSkeletonList from "./CardsSkeletonList";

const Cards = ({ onAddNew }) => {
  const { data, loading, error } = useQuery(GET_SUBSCRIPTIONS);

  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="w-full">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-start">
        {loading ? (
          <CardsSkeletonList count={6} />
        ) : data?.subscriptions && data.subscriptions.length > 0 ? (
          data.subscriptions.map((subscription) => (
            <Card key={subscription._id} subscription={subscription} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg font-semibold text-slate-900 mb-2">No subscriptions yet</p>
            <p className="text-slate-600 text-center max-w-md mb-4">
              Start tracking your recurring expenses by adding your first subscription.
            </p>
            <button
              onClick={onAddNew}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Your First Subscription</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default Cards;
