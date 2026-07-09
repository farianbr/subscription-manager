import { useState } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

const InputField = ({ label, id, name, type = "text", onChange, value, placeholder }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-muted mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          className={`w-full px-3 py-2.5 ${
            isPassword ? "pr-11" : ""
          } bg-surface border border-border rounded-xl text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200`}
          id={id}
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted hover:text-foreground transition-colors"
          >
            {show ? (
              <HiOutlineEyeOff className="w-5 h-5" aria-hidden="true" />
            ) : (
              <HiOutlineEye className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;
