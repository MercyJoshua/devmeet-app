"use client";
import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

const FeaturesSection = () => {
  const features = [
    {
      title: "Video Conferencing",
      icon: "/assets/images/video-conference.jpg",
      description: "Seamlessly connect with your team through high-quality video calls.",
      bgColor: "bg-blue-500",
    },
    {
      title: "Live Previews",
      icon: "/assets/images/code-preview.jpg",
      description: "Instantly preview your code as you type.",
      bgColor: "bg-red-500",
    },
    {
      title: "Code Completion",
      icon: "/assets/images/auto-completion.jpg",
      description: "Boost productivity with intelligent code suggestions.",
      bgColor: "bg-yellow-500",
    },
    {
      title: "Real-time Collaboration",
      icon: "/assets/images/collaboration.jpg",
      description: "Collaborate with your team in real time.",
      bgColor: "bg-purple-500",
    },
    {
      title: "Multi-language Support",
      icon: "/assets/images/multi-language.jpg",
      description: "Write code in multiple languages with ease.",
      bgColor: "bg-indigo-500",
    },
  ];

  return (
    <div
      id="features-section"
      className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-500">
          Features
        </h1>
      </div>

      <Swiper
        spaceBetween={30}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        navigation
        modules={[Autoplay, Pagination, Navigation]}
        breakpoints={{
          640: { slidesPerView: 1 }, // Small screens
          768: { slidesPerView: 2 }, // Tablets
          1024: { slidesPerView: 3 }, // Desktops
        }}
        className="flex justify-center items-center"
      >
        {features.map((feature, index) => (
          <SwiperSlide key={index} className="flex justify-center">
            <div
              className={`flex flex-col items-center w-full max-w-xs sm:max-w-sm md:max-w-md py-8 px-6 rounded-lg shadow-lg ${feature.bgColor}`}
              style={{
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(4, 47, 46, 0.5)",
              }}
            >
              <Image
                src={feature.icon}
                alt={feature.title}
                width={200}
                height={200}
                className="mb-4 rounded-md"
              />
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-white text-center">
                {feature.title}
              </h2>
              <p className="text-center text-sm sm:text-base md:text-lg text-white">
                {feature.description}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default FeaturesSection;