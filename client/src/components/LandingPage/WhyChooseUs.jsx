export default function WhyChooseUs() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
          {/* Teksti (majtas) */}
          <div>
            <p className="text-teal-600 font-semibold">Why Choose Us</p>
            <h2 className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              “Trusted Care for You and Your Family”
            </h2>
            <p className="mt-5 max-w-xl text-slate-600">
              “Simplifying healthcare with easy bookings, secure records, and dedicated medical professionals.”
            </p>
          </div>

          {/* Foto + badges (djathtas) */}
          <div className="relative">
            {/* Glow i butë prapa figurës */}
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-teal-200 to-blue-200 opacity-60 blur-2xl" />

            <div className="relative mx-auto w-80 sm:w-96 lg:w-[420px]">
              {/* Disqe dekorative */}
              <div className="absolute -z-10 left-1/2 -translate-x-1/2 -top-8 w-72 h-72 rounded-full bg-teal-100" />
              <div className="absolute -z-10 -left-6 bottom-0 w-48 h-48 rounded-full bg-blue-100" />

              {/* Foto e doktorit */}
                <img
                src="/HomeStaff.png"
                alt="Our senior doctor"
                className="relative z-0 w-full h-auto rounded-2xl object-cover drop-shadow-xl"
                />

                {/* Badge 1 */}
                <div className="absolute -left-4 bottom-6 z-20 bg-white/95 backdrop-blur rounded-xl shadow-lg px-4 py-3">
                <div className="text-2xl font-semibold text-slate-900">10+</div>
                <div className="text-xs text-slate-500">Years of Experience </div>
                </div>

                {/* Badge 2 */}
                <div className="absolute right-0 top-0 z-20 bg-white/95 backdrop-blur rounded-xl shadow-lg px-4 py-3">
                <div className="text-2xl font-semibold text-slate-900">50.000+</div>
                <div className="text-xs text-slate-500">Patients Treated</div>
                </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
