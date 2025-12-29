
export default function Tab({ active, children, ...props }) {
  return (
    <button
      className={`px-3 py-2 rounded-lg text-sm border
        ${active
          ? "bg-emerald-600 text-white border-emerald-600"
          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"}`}
      {...props}
    >
      {children}
    </button>
  );
}
