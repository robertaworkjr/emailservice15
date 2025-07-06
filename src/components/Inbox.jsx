import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { RefreshCw } from 'lucide-react';
import EmailList from './EmailList.jsx';
import SelectedEmail from './SelectedEmail.jsx';
import { generateMockEmail } from '../utils/emailUtils.js';

export default function Inbox({ 
  emails, 
  selectedEmail, 
  setSelectedEmail, 
  refreshing, 
  setRefreshing,
  onRefresh,
  isBackendMode = false
}) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Demo mode email generation
  useEffect(() => {
    if (!isBackendMode && emails.length === 0) {
      // Generate initial demo email after 2 seconds
      const initialTimeout = setTimeout(() => {
        try {
          const welcomeEmail = generateMockEmail();
          setEmails([welcomeEmail]);
        } catch (error) {
          console.error('Failed to generate initial demo email:', error);
        }
      }, 2000);

      // Generate random demo emails periodically
      const emailInterval = setInterval(() => {
        if (Math.random() < 0.4) { // 40% chance
          try {
            const newEmail = generateMockEmail();
            setEmails(prev => [newEmail, ...prev.slice(0, 9)]); // Keep max 10 emails
          } catch (error) {
            console.error('Failed to generate demo email:', error);
          }
        }
      }, 8000);

      return () => {
        clearTimeout(initialTimeout);
        clearInterval(emailInterval);
      };
    }
  }, [isBackendMode, emails.length]);

  useEffect(() => {
    let timeoutId;
    if (refreshing) {
      setIsLoading(true);
      timeoutId = setTimeout(() => {
        setRefreshing(false);
        setIsLoading(false);
      }, 1000);
    }
    return () => clearTimeout(timeoutId);
  }, [refreshing, setRefreshing]);

  const refreshInbox = useCallback(() => {
    try {
      setError(null);
      setRefreshing(true);
      
      if (isBackendMode && onRefresh) {
        onRefresh();
      } else {
        // Demo mode - just simulate refresh
        setTimeout(() => {
          setRefreshing(false);
        }, 1000);
      }
    } catch (err) {
      setError('Failed to refresh inbox');
      console.error('Refresh error:', err);
    }
  }, [setRefreshing, isBackendMode, onRefresh]);

  // Clear selection when emails change
  useEffect(() => {
    if (selectedEmail && !emails.find(email => email.id === selectedEmail.id)) {
      setSelectedEmail(null);
    }
  }, [emails, selectedEmail, setSelectedEmail]);

  return (
    <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-black">
          Inbox {isBackendMode ? '(Live)' : '(Demo)'}
        </h2>
        <button
          onClick={refreshInbox}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 
            rounded-lg text-black transition-all duration-200 disabled:opacity-50 
            disabled:cursor-not-allowed focus:outline-none focus:ring-2 
            focus:ring-black/50"
          aria-label={refreshing ? 'Refreshing inbox' : 'Refresh inbox'}
        >
          <RefreshCw 
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} 
            aria-hidden="true"
          />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 
          rounded-lg text-white text-sm">
          {error}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2 overflow-y-auto max-h-[400px] scrollbar-thin 
          scrollbar-thumb-white/20 scrollbar-track-transparent">
          <EmailList 
            emails={emails}
            setSelectedEmail={setSelectedEmail}
            loading={isLoading}
          />
        </div>
        
        <div className="md:w-1/2 overflow-y-auto max-h-[400px] scrollbar-thin 
          scrollbar-thumb-white/20 scrollbar-track-transparent">
          <SelectedEmail email={selectedEmail} />
        </div>
      </div>
    </div>
  );
}

Inbox.propTypes = {
  emails: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      subject: PropTypes.string.isRequired,
      from: PropTypes.string.isRequired,
      preview: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired
    })
  ).isRequired,
  selectedEmail: PropTypes.object,
  setSelectedEmail: PropTypes.func.isRequired,
  refreshing: PropTypes.bool.isRequired,
  setRefreshing: PropTypes.func.isRequired,
  onRefresh: PropTypes.func,
  isBackendMode: PropTypes.bool
};