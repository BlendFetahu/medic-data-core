export default function StaffIntro() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
          Find the Right Doctor for You
        </h2>
        <p className="mt-4 text-lg text-slate-600">
            Select your specialty of choice and connect with trusted doctors ready to provide the care 
            and guidance you need.
            
        </p>

        <div className="mt-8">
          <button
            onClick={scrollToTop}
            className="rounded-full bg-emerald-600 px-6 py-3 text-white font-semibold shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
          >
            Select Specialty
          </button>
        </div>
      </div>
    </section>
  );
}
