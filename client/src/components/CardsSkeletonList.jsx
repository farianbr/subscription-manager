import TransactionCardSkeleton from "./skeletons/TransactionCardSkeleton";

const CardsSkeletonList = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <TransactionCardSkeleton key={idx} />
      ))}
    </>
  );
};

export default CardsSkeletonList;
