import { HiOutlineSearch } from "react-icons/hi";

const selectClass =
  "h-10 pl-3 pr-8 rounded-xl bg-surface-2 border border-transparent text-sm text-foreground " +
  "hover:border-border focus:border-border-strong appearance-none cursor-pointer transition-colors " +
  "bg-no-repeat bg-[right_0.6rem_center] bg-[length:14px] " +
  "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%236e6d69%22 stroke-width=%222%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/%3E%3C/svg%3E')]";

const SORT_OPTIONS = [
  { key: "renewal", label: "Renewal date" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "name", label: "Name A–Z" },
];

/** Search + category / cycle / sort controls for the library. */
const SubscriptionFilters = ({ filters, onChange, categories, cycles }) => {
  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
      <div className="relative flex-1 min-w-0">
        <HiOutlineSearch
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
          aria-hidden="true"
        />
        <input
          id="subscription-search"
          type="search"
          value={filters.query}
          onChange={(e) => set({ query: e.target.value })}
          placeholder="Search subscriptions"
          aria-label="Search subscriptions"
          className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface-2 border border-transparent text-sm text-foreground placeholder:text-muted hover:border-border focus:border-border-strong transition-colors"
        />
      </div>

      <div className="flex gap-2.5 overflow-x-auto">
        <select
          value={filters.category}
          onChange={(e) => set({ category: e.target.value })}
          aria-label="Filter by category"
          className={selectClass}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c} className="capitalize">
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={filters.cycle}
          onChange={(e) => set({ cycle: e.target.value })}
          aria-label="Filter by billing cycle"
          className={selectClass}
        >
          <option value="all">All cycles</option>
          {cycles.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(e) => set({ sort: e.target.value })}
          aria-label="Sort subscriptions"
          className={selectClass}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SubscriptionFilters;
