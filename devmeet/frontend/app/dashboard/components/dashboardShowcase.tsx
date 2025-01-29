"use client";
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import axios from 'axios';
import { useEffect, useState } from 'react';

// type CarouselSlide = {
//   id: number;
//   image_url: string;
//   title: string;
//   description: string;
// };

type Highlight = {
  id: number;
  content: string;
};

const DashboardShowcase = () => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loadingHighlights, setLoadingHighlights] = useState(true);

  useEffect(() => {
    // const fetchCarouselSlides = async () => {
    //   try {
    //     const response = await axios.get<CarouselSlide[]>('/api/dashboard/carousel');
    //     setCarouselSlides(response.data);
    //   } catch (err) {
    //     console.error('Error fetching carousel data:', err);
    //   } finally {
    //     setLoadingCarousel(false);
    //   }
    // };

    const fetchHighlights = async () => {
      try {
        const response = await axios.get<Highlight[]>('/api/dashboard/highlights');
        setHighlights(response.data);
      } catch (err) {
        console.error('Error fetching highlights:', err);
      } finally {
        setLoadingHighlights(false);
      }
    };

    // fetchCarouselSlides();
    fetchHighlights();
  }, []);

  return (
    <div className="h-screen w-full max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto h-[95%] rounded-lg shadow-lg">
      {/* Carousel Section */}
      <div className="bg-gray-800 p-6 rounded">
        {/*  <Carousel /> */}
      </div>
      {/* Highlights Section */}
      <div className="bg-gray-800 p-6 rounded">
        <h2 className="text-white text-2xl mb-4">Highlights</h2>
        {loadingHighlights ? (
          <p className="text-gray-400">Loading highlights...</p>
        ) : highlights.length === 0 ? (
          <p className="text-gray-400">No highlights available</p>
        ) : (
          <ul className="max-h-64 overflow-y-auto space-y-4">
            {highlights.map((highlight) => (
              <li key={highlight.id} className="bg-gray-700 p-4 rounded">
                <p className="text-gray-300">{highlight.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DashboardShowcase;
