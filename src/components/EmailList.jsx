import React from 'react';
import PropTypes from 'prop-types';

export default function EmailList({ emails, setSelectedEmail, loading }) {
  if (loading) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading emails">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white/20 animate-pulse rounded-lg p-4 h-24"
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2" role="list">
      {emails.length === 0 ? (
        <div className="text-white text-center py-8">
          <p className="text-lg">No emails yet</p>
          <p className="text-sm text-white/70 mt-2">
            New emails will appear here when received
          </p>
        </div>
      ) : (
        emails.map((email) => (
          <div
            key={email.id}
            onClick={() => setSelectedEmail(email)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedEmail(email);
              }
            }}
            className="bg-white/30 hover:bg-white/40 cursor-pointer rounded-lg p-4 
              backdrop-blur-sm transition-all duration-200 transform hover:scale-[1.02]
              focus:outline-none focus:ring-2 focus:ring-white/50"
            role="listitem"
            tabIndex={0}
            aria-label={`Email from ${email.from} with subject ${email.subject}`}
          >
            <h3 className="text-white font-semibold truncate">
              {email.subject}
            </h3>
            <p className="text-white/80 text-sm truncate mt-1">
              {email.preview}
            </p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-white/60 text-xs">{email.from}</span>
              <time className="text-white/60 text-xs" dateTime={email.timestamp}>
                {email.time}
              </time>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

EmailList.propTypes = {
  emails: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      subject: PropTypes.string.isRequired,
      preview: PropTypes.string.isRequired,
      from: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired
    })
  ).isRequired,
  setSelectedEmail: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

EmailList.defaultProps = {
  emails: [],
  loading: false
};