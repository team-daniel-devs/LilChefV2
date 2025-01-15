const Desktop = () => {
  return (
    <div className="h-screen flex">
      {/* Left Section with Large Cut-Off Circle */}
      <div
        className="relative w-1/2 flex items-center justify-end overflow-hidden"
        style={{ backgroundColor: "#129b62" }}
      >
        {/* Large Circle */}
        <div className="absolute -left-72 md:-left-48 lg:-left-36 w-[50vw] h-[130vh] bg-white rounded-full flex items-center justify-center">
          {/* Logo */}
          <div className="text-center relative" style={{ left: "3vw" }}>
            <img
              src="/images/logo_better.png"
              alt="Better Logo"
              className="w-48 h-48"
            />
          </div>
        </div>
      </div>

      {/* Right Section with Custom Green Background */}
      <div
        className="w-1/2 text-white flex flex-col justify-center pl-12 pr-56"
        style={{ backgroundColor: "#129b62" }}
      >
        {/* Main Heading */}
        <h2 className="text-4xl font-semibold mb-4 text-left">
          A gourmet chef, right in your pocket.
        </h2>

        {/* Dynamic Subtext */}
        <p className="text-lg mb-6 text-left">
            Install and start using Lil'Chef as a beta tester by opening this page on your <b>mobile device</b>.
        </p>
      </div>
    </div>
  );
};

export default Desktop;
