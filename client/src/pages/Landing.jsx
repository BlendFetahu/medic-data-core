
import WhyChooseUs from "../components/LandingPage/WhyChooseUs";
import OurServices from "../components/LandingPage/OurServices";
import Slider from "../components/LandingPage/Slider";
import StaffIntro from "../components/LandingPage/StaffIntro";
import OurLocation from "../components/LandingPage/OurLocation";
import SearchBar from "../components/LandingPage/SearchBar"

export default function Landing() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-sky-700 text-white">

      {/* Search Bar */}
      <section className="text-center py-16">
          <SearchBar />
      </section>


     {/* Why Choose Us */}
      <section className="bg-white text-slate-900">
        <WhyChooseUs />
      </section>

      {/* Our Services */}
      <section>
        <OurServices />
      </section>


      {/* Slider */}
      <section className="py-10 bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700">
        <Slider />
      </section>


      {/* Staff Intro */}
      <section  className="bg-white text-slate-900 border-b-4 border-l-4 border-r-4 border-emerald-600 rounded-b-2xl">
        <StaffIntro />
      </section>


      {/* Our Location */}
      <section className="bg-white text-slate-900">
        <OurLocation />
      </section>


    </main>
    
  );
}
