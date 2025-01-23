import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Copy, Check, Inbox } from 'lucide-react';

export default function EmailActions({ 
  email = '', 
  copied = false, 
  copyToClipboard, 
  setShowInbox, 
  showInbox 
}) {
  const [copyError, setCopyError] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await copyToClipboard();
      setCopyError(false);
    } catch (error) {
      console.error('Copy failed:', error);
      setCopyError(true);
      // Auto-hide error after 3 seconds
      setTimeout(() => setCopyError(false), 3000);
    }
  }, [copyToClipboard]);

  if (!email) return null;

  return (
    <div className="mt-6 space-y-4">
      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 relative">
        <div className="flex items-center justify-between">
          <span className="text-black font-mono break-all text-sm md:text-base">
            {email}
          </span>
          <button
            onClick={handleCopy}
            className={`ml-4 p-2 ${
              copyError ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
            } rounded-lg transition-all duration-200 text-black focus:outline-none 
            focus:ring-2 focus:ring-black/50`}
            title="Copy email address"
            aria-label="Copy email address"
            disabled={copied}
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : copyError ? (
              <span className="text-sm px-2">Failed</span>
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
        </div>
        {copied && !copyError && (
          <div 
            className="copied-feedback" 
            role="status"
            aria-live="polite"
          >
            Copied!
          </div>
        )}
      </div>

      <button
        onClick={() => setShowInbox(!showInbox)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 
          bg-white/20 hover:bg-white/30 rounded-lg text-black transition-all 
          duration-200 focus:outline-none focus:ring-2 focus:ring-black/50"
        aria-label={showInbox ? 'Hide Inbox' : 'Show Inbox'}
        aria-expanded={showInbox}
      >
        <Inbox className="w-5 h-5" aria-hidden="true" />
        <span>{showInbox ? 'Hide Inbox' : 'Show Inbox'}</span>
      </button>
    </div>
  );
}

EmailActions.propTypes = {
  email: PropTypes.string,
  copied: PropTypes.bool.isRequired,
  copyToClipboard: PropTypes.func.isRequired,
  setShowInbox: PropTypes.func.isRequired,
  showInbox: PropTypes.bool.isRequired
};
