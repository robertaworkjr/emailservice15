import React, { useState, useEffect, useCallback } from 'react';
import { Mail, DollarSign } from 'lucide-react'; // Importing the crypto icon
import TimerDisplay from './TimerDisplay.jsx';
import EmailActions from './EmailActions.jsx';
import Inbox from './Inbox.jsx';
import { generateEmail, generateMockEmail } from '../utils/emailUtils.js';

export default function HeroSection() {
  const [minutes, setMinutes] = useState(15);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          setMinutes(prev => prev - 1);
          setSeconds(59);
        } else {
          setSeconds(prev => prev - 1);
        }
      }, 1000);
    } else if (minutes === 0 && seconds === 0) {
      handleExpiration();
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  // Mock email generation effect
  useEffect(() => {
    if (showInbox && isActive) {
      const emailInterval = setInterval(() => {
        if (Math.random() < 0.3) { // 30% chance to receive email
          try {
            const newEmail = generateMockEmail();
            setEmails(prev => [newEmail, ...prev]);
          } catch (error) {
            console.error('Failed to generate mock email:', error);
          }
        }
      }, 5000);
      return () => clearInterval(emailInterval);
    }
  }, [showInbox, isActive]);

  const handleExpiration = useCallback(() => {
    setIsActive(false);
    setEmail('');
    setShowInbox(false);
    setEmails([]);
    setSelectedEmail(null);
  }, []);

  const startTimer = useCallback(() => {
    try {
      const newEmail = generateEmail();
      console.log('Generated Email:', newEmail); // Added console log
      setEmail(newEmail);
      setIsActive(true);
      setError(null);
    } catch (error) {
      setError('Failed to generate email address');
      console.error('Start timer error:', error);
    }
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setMinutes(15);
    setSeconds(0);
    setEmail('');
    setShowInbox(false);
    setEmails([]);
    setSelectedEmail(null);
    setError(null);
  }, []);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      throw new Error('Failed to copy to clipboard');
    }
  }, [email]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      handleExpiration();
    };
  }, [handleExpiration]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-blue-500 to-indigo-600 flex items-center justify-center px-4 py-8">
      <div className="max-w-6xl w-full space-y-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 shadow-2xl border border-white/20">
          <div className="flex flex-col items-center space-y-4">
            <Mail className="w-16 h-16 text-white" />
            <h1 className="text-4xl md:text-5xl font-bold text-white font-inter tracking-tight text-center">
              15-Minute Email
            </h1>
            <p className="text-lg text-white/80 text-center max-w-2xl">
              Get a temporary, random email address that self-destructs after 15 minutes.
              Use it to sign up for services, verify accounts, or test features without
              exposing your real email address.
            </p>
            <div className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold text-white text-center">Recommended Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="https://325385rjsoqns83nw7mm2d-h8a.hop.clickbank.net/?&traffic_source=google&traffic_type=Website&campaign=spring&creative=website"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 transition-colors p-4 rounded-lg flex items-center space-x-4"
                >
                  <DollarSign className="w-8 h-8 text-white" /> {/* Crypto icon */}
                  <div>
                    <p className="text-white font-medium">Crypto Services</p>
                    <p className="text-white/80 text-sm">Explore various crypto services</p>
                  </div>
                </a>
                <a
                  href="https://d5b422qmptsnmy8dxtsf305s6t.hop.clickbank.net/?&traffic_source=google&traffic_type=native&campaign=spring&creative=website"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 transition-colors p-4 rounded-lg flex items-center space-x-4"
                >
                  <DollarSign className="w-8 h-8 text-white" /> {/* Crypto icon */}
                  <div>
                    <p className="text-white font-medium">Spring Marketing</p>
                    <p className="text-white/80 text-sm">Boost your online income</p>
                  </div>
                </a>
                <a
                  href="https://16c706wakjvbx01xxekd7s7v88.hop.clickbank.net/?&traffic_source=google&traffic_type=webinar&creative=video"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 transition-colors p-4 rounded-lg flex items-center space-x-4"
                >
                  <DollarSign className="w-8 h-8 text-white" /> {/* Crypto icon */}
                  <div>
                    <p className="text-white font-medium">Webinar Services</p>
                    <p className="text-white/80 text-sm">Join our informative webinars</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-white text-center">
              {error}
            </div>
          )}

          <TimerDisplay minutes={minutes} seconds={seconds} />
          
          <EmailActions
            email={email}
            copied={copied}
            copyToClipboard={copyToClipboard}
            setShowInbox={setShowInbox}
            showInbox={showInbox}
          />
          
          {showInbox && (
            <Inbox
              emails={emails}
              selectedEmail={selectedEmail}
              setSelectedEmail={setSelectedEmail}
              setEmails={setEmails}
              refreshing={refreshing}
              setRefreshing={setRefreshing}
            />
          )}
          
          <div className="text-center mt-6">
            {!isActive ? (
              <button
                onClick={startTimer}
                className="btn-primary"
                aria-label="Start 15 minute timer"
              >
                Start
              </button>
            ) : (
              <button
                onClick={resetTimer}
                className="btn-secondary"
                aria-label="Reset timer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
