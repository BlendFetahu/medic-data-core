import React, { useState, useEffect } from "react";

export default function Slider() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    "/slider1.jpg",
    "/slider2.jpg",
    "/slider3.jpg",
    "/slider4.jpg",
  ];

  useEffect(() => {
    const changeSlide = setInterval(() => {
      setActiveSlide((slide) => (slide < slides.length - 1 ? slide + 1 : 0));
    }, 3000);
    return () => clearInterval(changeSlide);
  }, [slides.length]);

  return (
  <section className="bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 py-8">
  <div className="mx-auto max-w-5xl px-4 text-center text-white">
    <h2 className="text-2xl sm:text-3xl font-bold">A Glimpse Into Our Clinic</h2>
    <p className="mt-2 text-sm sm:text-base text-emerald-100">
      Discover our modern facilities designed to keep you comfortable and cared for.
    </p>

    {slides.length > 0 && (
      <img
        src={slides[activeSlide]}
        alt="Clinic presentation"
        className="mt-6 mx-auto w-full max-w-4xl h-56 sm:h-72 md:h-80 lg:h-[360px] rounded-xl shadow-xl object-cover"
      />
    )}
  </div>
</section>

  );
}

