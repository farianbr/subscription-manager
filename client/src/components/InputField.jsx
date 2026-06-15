const InputField = ({ label, id, name, type, onChange, value, placeholder }) => {

  if(!type){
    type = "text"
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-muted mb-1.5">
        {label}
      </label>
      <input
        className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
      />
    </div>
  );
};

export default InputField;
