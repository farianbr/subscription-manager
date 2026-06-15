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
          <div className="col-span-full flex flex-col items-center justify-center py-16">
            <svg className="w-14 h-14 text-muted/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg font-semibold tracking-tight text-foreground mb-1.5">No subscriptions yet</p>
            <p className="text-muted text-center max-w-md mb-5">
              Start tracking your recurring expenses by adding your first subscription.
            </p>
            <button
              onClick={onAddNew}
              className="px-6 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-accent-fg font-medium transition-colors"
            >
              Add Your First Subscription
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default Cards;
