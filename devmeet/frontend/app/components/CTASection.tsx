const CTASection = () => {
  return (
    <div className="container mx-auto flex justify-between items-center px-6 py-4">
    <div
      id="cta-section"
      className="mt-4 py-16 mb-8 text-white text-left px-4 sm:px-8 lg:px-16 xl:px-24"
    >
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-purple-500">
        Ready to Collaborate Seamlessly?
      </h2>

      <p className="text-base sm:text-lg lg:text-xl mb-8">
        Start your journey with{" "}
        <span className="font-bold text-purple-500">DevMeet</span> and take your
        team collaboration to the next level.
      </p>

      <a
        href="#signup"
        className="bg-white text-purple-600 font-semibold py-3 px-6 sm:px-8 rounded-full hover:bg-purple-700 hover:text-white transition duration-300 ease-in-out"
      >
        Get Started for Free
      </a>
    </div>
    </div>
    
  );
};

export default CTASection;
