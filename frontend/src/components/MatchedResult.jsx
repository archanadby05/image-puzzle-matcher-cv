// src/components/MatchedResult.jsx
import React from 'react';
import { motion } from 'framer-motion';

function MatchedResult({ matched, overlaid }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium">Matched Result</h2>
      <motion.img
        key={overlaid}
        src={overlaid}
        alt="Overlaid Result"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded shadow-lg max-w-full"
      />
      <h3 className="text-md font-semibold text-gray-600">Keypoint Matches:</h3>
      <img
        src={matched}
        alt="Feature Matches"
        className="rounded border shadow-sm max-w-full"
      />
    </div>
  );
}

export default MatchedResult;
