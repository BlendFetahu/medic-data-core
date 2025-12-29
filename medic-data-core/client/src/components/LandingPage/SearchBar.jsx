import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SPECIALTY_OPTIONS = [
  "General",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Orthopedics",
  "Neurology",
];

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const onFind = () => {
    const params = new URLSearchParams();
    const q = (query || "").trim();
    if (q) params.set("specialty", q);
    const qs = params.toString();
    navigate(qs ? `/search?${qs}` : "/search");
  };

  return (
    <section className="text-center py-12 sm:py-16">
     
      <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white px-4">
        Need To Quickly Consult With Doctor?
      </h1>

      
      <div className="mt-8 sm:mt-10 mx-auto w-full max-w-md sm:max-w-xl lg:max-w-4xl px-4 sm:px-0">
        <div
          className="
            rounded-2xl sm:rounded-full bg-white text-slate-700 shadow-2xl ring-1 ring-black/5 overflow-hidden
            flex flex-col sm:flex-row
          "
        >
        
          <div className="flex items-center gap-3 px-4 sm:px-5 py-3 flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="7" strokeWidth="2" />
              <path d="M20 20l-3-3" strokeWidth="2" />
            </svg>

            <select
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="
                w-full bg-transparent outline-none text-sm sm:text-base
                py-2
              "
              aria-label="Select a specialty"
              required
            >
              <option value=""> Select Specialty </option>
              {SPECIALTY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* button */}
          <div className="px-3 py-2 sm:py-2.5 flex items-center justify-center sm:justify-end">
            <button
              onClick={onFind}
              className="
                w-full sm:w-auto
                rounded-xl sm:rounded-full
                bg-amber-500 px-6 py-3 text-white font-semibold
                hover:bg-amber-600 active:scale-[.99] transition
              "
            >
              Find
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
