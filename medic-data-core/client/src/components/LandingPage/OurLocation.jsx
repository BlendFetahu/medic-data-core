
export default function Location() {
  return (
    <section className="relative overflow-hidden bg-white py-16">
    
      <svg
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 opacity-20"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fill="#10B981" d="M39.5,-63.4C52.7,-56.6,66.6,-52.9,74.5,-43.8C82.4,-34.8,84.4,-20.4,84.8,-6.2C85.2,8.1,84,22.2,77.6,33.7C71.2,45.2,59.7,54,47,62.2C34.4,70.4,20.7,77.9,6.1,79.2C-8.6,80.4,-17.1,75.4,-28,70C-38.8,64.5,-52,58.6,-63.5,49C-75,39.5,-84.8,26.3,-88.1,11.4C-91.4,-3.6,-88.2,-20.2,-79.9,-33.2C-71.7,-46.2,-58.5,-55.5,-45.4,-62.3C-32.3,-69,-19.2,-73.2,-5.1,-70.4C9,-67.6,18.1,-57.8,39.5,-63.4Z" transform="translate(100 100)" />
      </svg>
      <svg
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 opacity-10"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fill="#14B8A6" d="M48.1,-62.3C62.5,-54.4,75.3,-41.3,79.7,-26.2C84.2,-11.1,80.3,6,73.8,21.8C67.4,37.6,58.5,51.9,45.9,63.4C33.2,74.8,16.6,83.3,0.8,82.1C-15,81,-30,70.2,-43,59.4C-56.1,48.7,-67.2,38,-72.6,24.4C-78.1,10.8,-77.8,-5.6,-72.8,-20.1C-67.9,-34.6,-58.3,-47.2,-46.2,-56.3C-34.1,-65.4,-17,-70.9,-0.3,-70.5C16.4,-70.2,32.8,-64.1,48.1,-62.3Z" transform="translate(100 100)" />
      </svg>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading with pin icon */}
        <div className="text-center mb-10">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-emerald-700 ring-1 ring-emerald-200">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1 1 18 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>We’re easy to find</span>
          </div>

          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900">
            Our Location
          </h2>
          <p className="mt-3 text-slate-600">
            Near the <span className="font-medium text-slate-800">Bill Clinton Statue, Prishtina</span>.  
            Visit us or reach out for directions.
          </p>
        </div>

       
        <div className="relative">
          {/* Map */}
          <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-gray-200">
            <iframe
              title="Clinic Location - Bill Clinton Statue, Prishtina"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2946.916992683756!2d21.16213487569177!3d42.64823881742438!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13549ee251a170c9%3A0x52be3ec9e3ea3640!2sBill%20Clinton%20Statue!5e0!3m2!1sen!2s!4v1735484100000!5m2!1sen!2s"
              width="100%"
              height="450"
              allowFullScreen=""
              loading="lazy"
              className="w-full h-[380px] md:h-[480px] border-0"
            ></iframe>
          </div>
        </div>

        <div className="h-12" />
      </div>
    </section>
  );
}
