

const options = [
  { value: "C#", label: "C#", disabled: false },
  { value: "Python", label: "Python", disabled: true },
  { value: "JavaScript", label: "JavaScript", disabled: false },
  { value: "Java", label: "Java", disabled: true },
];

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
}

import { useRef, useEffect, useState } from "react";

export default function CustomSelect({ value, onChange }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative w-full" ref={selectRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="text-base font-medium rounded-xl text-white py-3 px-5 bg-primary hover:text-primary border border-primary hover:bg-transparent w-full flex justify-between items-center focus:outline-none truncate relative"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate" title={value ? value : "Select Language"}>{value ? value : "Select Language"}</span>
        <span className="ml-2">▼</span>
        {/* Tooltip on hover for full text */}
        <span
          className="absolute left-0 top-full mt-1 w-max bg-black text-white text-sm rounded px-2 py-1 z-20 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{
            visibility: value && value.length > 18 ? "visible" : "hidden"
          }}
        >
          {value}
        </span>
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 mt-2 z-10 bg-primary rounded-2xl shadow-lg w-full"
          role="listbox"
        >
          {options.map((opt) => {
            const isDisabled = !!opt.disabled;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={value === opt.value}
                tabIndex={isDisabled ? -1 : 0}
                aria-disabled={isDisabled}
                className={`px-6 py-4 text-base rounded-2xl transition-all ${isDisabled ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "cursor-pointer"} ${value === opt.value && !isDisabled ? "bg-primary text-black font-bold" : !isDisabled ? "text-white hover:bg-white hover:text-primary" : ""}`}
                onClick={() => {
                  if (!isDisabled) {
                    onChange(opt.value);
                    setOpen(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (!isDisabled && (e.key === "Enter" || e.key === " ")) {
                    onChange(opt.value);
                    setOpen(false);
                  }
                }}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
