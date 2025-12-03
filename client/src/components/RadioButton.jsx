const RadioButton = ({ id, label, onChange, value, checked }) => {
  return (
    <div className="inline-flex items-center">
      <label className="relative flex items-center cursor-pointer" htmlFor={id}>
        <input
          name="type"
          type="radio"
          className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border-2 border-slate-300 checked:border-blue-600 checked:border-[5px] transition-all duration-200 hover:border-slate-400"
          id={id}
          value={value}
          onChange={onChange}
          checked={checked}
        />
      </label>
      <label className="ml-2 text-sm font-medium text-slate-700 cursor-pointer select-none" htmlFor={id}>
        {label}
      </label>
    </div>
  );
};

export default RadioButton;
