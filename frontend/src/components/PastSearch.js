import React from "react";

export default function PastSearch({ text, onRemove }) {
  return (
    <div className="flex justify-between items-center bg-white px-4 py-2 rounded-md shadow-md">
      <span className="text-gray-700 text-base">{text}</span>
      <button
        onClick={onRemove}
        className="text-gray-500 hover:text-red-500 focus:outline-none"
        aria-label="Remove"
      >
        ✕
      </button>
    </div>
  );
}