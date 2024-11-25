import React from "react";

const CustomButton = ({ bgColor, textColor, content, onClick }) => {
  return (
    <button
      className={`mt-3 rounded-full py-3 px-6 ${bgColor} shadow-md`}
      onClick={onClick}
    >
      <span className={`text-center text-base font-extrabold ${textColor}`}>
        {content}
      </span>
    </button>
  );
};

export default CustomButton;
