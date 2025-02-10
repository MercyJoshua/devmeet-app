const HowItWorksSection = () => {
  return (
    <div className="flex justify-center items-center w-full py-12 bg-gray-900">
      <div className="w-full max-w-6xl px-4">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-purple-500">How it Works</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-12">
          {/* Step 1 */}
          <div className="flex flex-col items-center space-y-4">
            <span className="text-lg font-bold text-purple-500">Step 1</span>
            <h1 className="text-xl font-semibold">Sign Up</h1>
            <p className="text-gray-300">Create your free account in just a few minutes</p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center space-y-4">
            <span className="text-lg font-bold text-purple-500">Step 2</span>
            <h1 className="text-xl font-semibold">Set Up</h1>
            <p className="text-gray-300">Set up your first coding project</p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center space-y-4">
            <span className="text-lg font-bold text-purple-500">Step 3</span>
            <h1 className="text-xl font-semibold">Start Collaborating</h1>
            <p className="text-gray-300">Invite your team members to join the project</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksSection;