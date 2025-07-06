import React, { useState, useEffect, useCallback } from 'react';
import { Mail, DollarSign, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import TimerDisplay from './TimerDisplay.jsx';
import EmailActions from './EmailActions.jsx';
import Inbox from './Inbox.jsx';
import ApiService from '../services/api.js';
import WebSocketService from '../services/websocket.js';

export default function HeroSection() {
  const [minutes, setMinutes] = useState(15);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [email, setEmail] = useState('');
  const [emailData, setEmailData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isBackendMode, setIsBackendMode] = useState(false);

  // Check if backend is available
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const health = await ApiService.checkHealth();
        if (health.status === 'healthy') {
          setIsBackendMode(true);
          console.log('Backend mode enabled');
        }
      } catch (error) {
        console.log('Backend not available, using demo mode');
        setIsBackendMode(false);
      }
    };

    checkBackend();
  }, []);

  // WebSocket connection
  useEffect(() => {
    if (isBackendMode) {
      WebSocketService.on('connected', () => {
        setIsConnected(true);
        console.log('WebSocket connected');
      });

      WebSocketService.on('disconnected', () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
      });

      WebSocketService.on('newEmail', (data) => {
        console.log('New email received via WebSocket:', data);
        if (data.email === email) {
          refreshMessages();
        }
      });

      WebSocketService.connect();

      return () => {
        WebSocketService.disconnect();
      };
    }
  }, [isBackendMode, email]);

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
    } else if (minutes === 0 && seconds === 0 && isActive) {
      handleExpiration();
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  // Auto-refresh messages when inbox is open
  useEffect(() => {
    if (showInbox && isActive && email && isBackendMode) {
      const interval = setInterval(() => {
        refreshMessages();
      }, 10000); // Refresh every 10 seconds

      return () => clearInterval(interval);
    }
  }, [showInbox, isActive, email, isBackendMode]);

  const handleExpiration = useCallback(() => {
    setIsActive(false);
    setEmail('');
    setEmailData(null);
    setShowInbox(false);
    setEmails([]);
    setSelectedEmail(null);
  }, []);

  const startTimer = useCallback(async () => {
    try {
      setError(null);
      
      if (isBackendMode) {
        // Use real backend
        const data = await ApiService.generateEmail();
        setEmailData(data);
        setEmail(data.email);
        console.log('Generated real email:', data.email);
      } else {
        // Use demo mode
        const demoEmail = generateDemoEmail();
        setEmail(demoEmail);
        console.log('Generated demo email:', demoEmail);
      }
      
      setIsActive(true);
      setMinutes(15);
      setSeconds(0);
      setEmails([]);
      setSelectedEmail(null);
    } catch (error) {
      setError(error.message || 'Failed to generate email address');
      console.error('Start timer error:', error);
    }
  }, [isBackendMode]);

  const generateDemoEmail = () => {
    const adjectives = ['quick', 'bright', 'cool', 'smart', 'fast'];
    const nouns = ['fox', 'cat', 'dog', 'bird', 'fish'];
    const numbers = Math.floor(Math.random() * 999) + 1;
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${adjective}${noun}${numbers}@demo.15min.mail`;
  };

  const refreshMessages = useCallback(async () => {
    if (!email || !isBackendMode) return;

    try {
      setRefreshing(true);
      const messages = await ApiService.getMessages(email);
      setEmails(messages);
    } catch (error) {
      console.error('Failed to refresh messages:', error);
      setError('Failed to load messages');
    } finally {
      setRefreshing(false);
    }
  }, [email, isBackendMode]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setMinutes(15);
    setSeconds(0);
    setEmail('');
    setEmailData(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-blue-500 to-indigo-600 flex items-center justify-center px-4 py-8">
      <div className="max-w-6xl w-full space-y-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 shadow-2xl border border-white/20">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-4">
              <Mail className="w-16 h-16 text-white" />
              {isBackendMode && (
                <div className="flex items-center space-x-2">
                  {isConnected ? (
                    <Wifi className="w-6 h-6 text-green-300" />
                  ) : (
                    <WifiOff className="w-6 h-6 text-red-300" />
                  )}
                  <span className="text-white/80 text-sm">
                    {isConnected ? 'Live' : 'Offline'}
                  </span>
                </div>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white font-inter tracking-tight text-center">
              15-Minute Email
            </h1>
            <p className="text-lg text-white/80 text-center max-w-2xl">
              Get a temporary, random email address that self-destructs after 15 minutes.
              Use it to sign up for services, verify accounts, or test features without
              exposing your real email address.
            </p>
            
            {/* Mode indicator */}
            <div className={`border rounded-lg p-4 mt-4 max-w-2xl ${
              isBackendMode 
                ? 'bg-green-500/20 border-green-500/40' 
                : 'bg-yellow-500/20 border-yellow-500/40'
            }`}>
              <div className="flex items-start space-x-3">
                <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                  isBackendMode ? 'text-green-300' : 'text-yellow-300'
                }`} />
                <div className={`text-sm ${
                  isBackendMode ? 'text-green-100' : 'text-yellow-100'
                }`}>
                  <p className="font-medium mb-1">
                    {isBackendMode ? 'Live Mode' : 'Demo Mode'}
                  </p>
                  <p>
                    {isBackendMode 
                      ? 'Connected to real email server. Generated emails can receive actual messages.'
                      : 'Backend not available. Generated emails are simulated and cannot receive real messages.'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold text-white text-center">Recommended Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="https://325385rjsoqns83nw7mm2d-h8a.hop.clickbank.net/?&traffic_source=google&traffic_type=Website&campaign=spring&creative=website"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 transition-colors p-4 rounded-lg flex items-center space-x-4"
                >
                  <DollarSign className="w-8 h-8 text-white" />
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
                  <DollarSign className="w-8 h-8 text-white" />
                  <div>
                    <p className="text-white font-medium">Spring Marketing</p>
                    <p className="text-white/80 text-sm">Boost your online income</p>
                  </div>
                </a>
                <a
                  href="https://16c706wakjvbx01xxekd7v88.hop.clickbank.net/?&traffic_source=google&traffic_type=webinar&creative=video"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 transition-colors p-4 rounded-lg flex items-center space-x-4"
                >
                  <DollarSign className="w-8 h-8 text-white" />
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
          
          {email && (
            <EmailActions
              email={email}
              copied={copied}
              copyToClipboard={copyToClipboard}
              setShowInbox={setShowInbox}
              showInbox={showInbox}
            />
          )}
          
          {showInbox && (
            <Inbox
              emails={emails}
              selectedEmail={selectedEmail}
              setSelectedEmail={setSelectedEmail}
              setEmails={setEmails}
              refreshing={refreshing}
              setRefreshing={setRefreshing}
              onRefresh={refreshMessages}
              isBackendMode={isBackendMode}
            />
          )}
          
          <div className="text-center mt-6">
            {!isActive ? (
              <button
                onClick={startTimer}
                className="btn-primary"
                aria-label="Start 15 minute timer"
              >
                Generate Email & Start Timer
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