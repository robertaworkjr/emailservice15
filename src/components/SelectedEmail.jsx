import React from 'react';
import PropTypes from 'prop-types';

export default function SelectedEmail({ email }) {
  if (!email) {
    return (
      <div className="text-center py-8">
        <p className="text-white/70 text-lg">Select an email to view its contents</p>
      </div>
    );
  }

  return (
    <div className="bg-white/30 backdrop-blur-sm rounded-lg p-6 mt-4">
      <div className="border-b border-white/20 pb-4 mb-4">
        <h3 className="text-xl font-semibold text-white mb-2">{email.subject}</h3>
        <div className="flex justify-between items-center text-white/70 text-sm">
          <span>{email.from}</span>
          <time dateTime={email.timestamp}>{email.time}</time>
        </div>
      </div>
      <div className="text-white space-y-4 leading-relaxed">
        {email.body.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      {email.attachments && email.attachments.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/20">
          <h4 className="text-white/80 font-medium mb-2">Attachments</h4>
          <div className="flex flex-wrap gap-2">
            {email.attachments.map((attachment, index) => (
              <div
                key={index}
                className="bg-white/20 rounded px-3 py-2 text-sm text-white/90 
                  flex items-center gap-2"
              >
                <svg 
                  className="w-4 h-4" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" 
                  />
                </svg>
                {attachment.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

SelectedEmail.propTypes = {
  email: PropTypes.shape({
    id: PropTypes.string.isRequired,
    subject: PropTypes.string.isRequired,
    from: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    attachments: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired
      })
    )
  })
};

SelectedEmail.defaultProps = {
  email: null
};
