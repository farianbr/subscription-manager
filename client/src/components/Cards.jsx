import { useQuery } from "@apollo/client/react";
import Card from "./Card";
import { GET_TRANSACTIONS } from "../graphql/queries/transaction.queries";
import CardsSkeletonList from "./CardsSkeletonList";

const Cards = () => {
  const { data, loading, error } = useQuery(GET_TRANSACTIONS);

  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="w-full px-10 min-h-[40vh]">
      <p className="text-5xl font-bold text-center my-10">History</p>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 justify-start mb-20">
        {loading ? (
          <CardsSkeletonList count={3} />
        ) : data?.transactions.length > 0 ? (
          data.transactions.map((txn) => (
            <Card key={txn._id} transaction={txn} />
          ))
        ) : (
          <p className="text-2xl font-bold text-center w-full">
            No transaction history found.
          </p>
        )}
      </div>
    </div>
  );
};
export default Cards;
