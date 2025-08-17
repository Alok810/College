import React from "react";

export default function InstituteHeader() {
  const auth = JSON.parse(localStorage.getItem("auth"));

  if (!auth?.instituteName) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-20 shadow-lg p-4 flex items-center gap-3 rounded-xl w-fit mx-auto mt-4"
      style={{
        background:
          "linear-gradient(to right, #d6f8df, rgb(227, 224, 250), #88e4f4)",
      }}
    >
      {/* Show uploaded logo or fallback */}
      {auth.logo ? (
        <img
          src={auth.logo}
          alt="Institute Logo"
          className="w-12 h-12 object-contain rounded-md shadow"
        />
      ) : (
        <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-md shadow text-gray-600 text-sm">
          LOGO
        </div>
      )}

      {/* Institute Name */}
      <h2 className="text-lg font-semibold text-gray-800 drop-shadow-sm">
        {auth.instituteName}
      </h2>
    </div>
  );
}
