import { getRates } from "../utils/exchangeRates.js";

const exchangeRateResolver = {
  Query: {
    exchangeRates: async () => {
      const { rates, fetchedAt, source } = await getRates();
      return {
        base: "USD",
        source,
        fetchedAt: new Date(fetchedAt).toISOString(),
        rates: Object.entries(rates).map(([code, rate]) => ({ code, rate })),
      };
    },
  },
};

export default exchangeRateResolver;
