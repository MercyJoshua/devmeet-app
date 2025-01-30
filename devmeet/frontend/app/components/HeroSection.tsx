import Image from 'next/image';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <div className="container mx-auto flex justify-between items-center px-6 py-4">
    <div id="hero-section" className="flex flex-col-reverse md:flex-row items-center justify-between px-4 md:px-16 lg:px-24 py-12 text-white">
      <div className="md:w-1/2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-500 leading-tight mb-4">
          Collaborate on Code <br />
          Seamlessly in <br />
          Real-Time
        </h1>
        <p className="text-base sm:text-lg lg:text-xl mb-6">
          A powerful, real-time collaborative <br /> tool for developers.
        </p>

        {/* Email Input and CTA Buttons */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-center mt-8">
          <input 
            type="email" 
            placeholder="you@mail.com" 
            className="w-full sm:w-auto bg-white text-gray-900 py-2 px-4 rounded-l-md focus:outline-none focus:ring focus:border-blue-500"
          />
          <Link href="/auth/SignUpForm" replace scroll={false}>
            <button className="bg-purple-600 text-white px-6 py-2 font-medium rounded-md hover:bg-purple-700 transition w-full sm:w-auto">
              Get Started
            </button>
          </Link>

          <div className="hidden sm:block border-r border-gray-500 h-10 mx-2"></div>
          <button className="border border-gray-500 text-white px-6 py-2 rounded-md hover:bg-white hover:text-gray-900 transition w-full sm:w-auto">
            Learn more
          </button>
        </div>
      </div>

      {/* Hero Image with Background */}
      <div
        id="hero-image"
        className="bg-gradient-to-r from-purple-500 to-pink-500 h-72 w-72 sm:h-96 sm:w-96 rounded-full flex-shrink-0 mb-8 md:mb-0 overflow-hidden"
      >
        <Image
          src="/assets/images/background.jpg" 
          alt="Picture of the developers"
          className="object-cover w-full h-full"
          width={500}
          height={500}
        />
      </div>
      </div>
    </div>
  );
};

export default HeroSection;