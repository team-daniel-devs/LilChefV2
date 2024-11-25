import React from "react";

export default function Heading({ content }) {
  return (
    <h1 className="text-gray-800 text-4xl font-extrabold">
      {content}
    </h1>
  );
}
