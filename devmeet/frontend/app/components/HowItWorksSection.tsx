const HowItWorksSection = () => {
  return (
    <div className="py-8 mt-8 text-white">
      <div className="text-left">
        <h1 className="text-3xl font-bold mb-4 text-purple-500">How it Works</h1>
      </div>

      <div id="how-it-works" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 py-12 text-center md:text-left">
        
        {/* Step 1 */}
        <div className="flex flex-col items-center md:items-start space-y-6">
          <span className="text-lg font-bold text-purple-500">Step 1</span>
          <h1 className="text-2xl font-semibold">Sign Up</h1>
          <p className="text-gray-300">Create your free account<br/>in just a few minutes</p>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center md:items-start space-y-6">
          <span className="text-lg font-bold text-purple-500">Step 2</span>
          <h1 className="text-2xl font-semibold">Set Up</h1>
          <p className="text-gray-300">Set up your first coding project</p>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center md:items-start space-y-6">
          <span className="text-lg font-bold text-purple-500">Step 3</span>
          <h1 className="text-2xl font-semibold">Start Collaborating</h1>
          <p className="text-gray-300">Invite your team members<br/>to join the project</p>
        </div>

      </div>  
    </div>
  );
};

export default HowItWorksSection;
