import React from "react";

const HomePage: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-neonBlue mb-4">
        Fake News Detection
      </h1>
      <p className="text-gray-400 text-lg">
        Validate and identify misinformation across the internet.  
        Choose a category from the navigation bar.
      </p>
    </div>
  );
};

export default HomePage;
