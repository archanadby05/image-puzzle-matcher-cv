import React from 'react';

function MatchedResult({ matchedImages }) {
  if (matchedImages.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-center">Match Results</h2>
      <div className="flex flex-wrap justify-center gap-4">
        {matchedImages.map((match, idx) => (
          <div key={idx} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
            <img
              src={`data:image/png;base64,${match.matchImage}`}
              alt={`Matched piece ${match.pieceIndex}`}
              className="w-full rounded shadow"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default MatchedResult;
