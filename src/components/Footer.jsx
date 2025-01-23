import React from 'react';
import { Shield, ExternalLink, Heart, Zap, Brain, Star, Coffee, Sparkles, Mail } from 'lucide-react';

const affiliateLinks = [
  {
    id: 1,
    icon: <Shield className="w-4 h-4" />,
    title: "Dental Health",
    url: "https://prodentim.com/text.php?&shield=2ee289q9nzkmar8j1ktbwllka3&traffic_source=google&traffic_type=blog&campaign=spring&creative=video"
  },
  {
    id: 2,
    icon: <Heart className="w-4 h-4" />,
    title: "Wellness",
    url: "https://803347wjwocz0w3ahsk54jpn8z.hop.clickbank.net/?&traffic_source=blog&traffic_type=google&campaign=spring&creative=video"
  },
  {
    id: 3,
    icon: <Brain className="w-4 h-4" />,
    title: "Mental Focus",
    url: "https://5e4df3meqw9v4m6figzjva6r0x.hop.clickbank.net/?&traffic_source=google&traffic_type=blog&campaign=spring&creative=video"
  },
  {
    id: 4,
    icon: <Zap className="w-4 h-4" />,
    title: "Energy Boost",
    url: "https://872c1wpaor9o4u22wprgltfwdo.hop.clickbank.net/?&traffic_source=google&traffic_type=blog&campaign=spring&creative=video"
  },
  {
    id: 5,
    icon: <Star className="w-4 h-4" />,
    title: "Self Care",
    url: "https://1baa28nhp-9sdw5hzbibtgo6eu.hop.clickbank.net/?&traffic_source=google&traffic_type=blog&campaign=spring&creative=video"
  },
  {
    id: 6,
    icon: <Coffee className="w-4 h-4" />,
    title: "Lifestyle",
    url: "https://039d4yzhizjs1n7gmm1rx72xeh.hop.clickbank.net/?&traffic_source=google&traffic_type=blog&campaign=spring&creative=video"
  },
  {
    id: 7,
    icon: <Sparkles className="w-4 h-4" />,
    title: "Wellbeing",
    url: "https://de8bf2xam06u2t28n114jdq79m.hop.clickbank.net/?&traffic_source=google&traffic_type=blog&campaign=spring&creative=video"
  }
];

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-blue-50 to-blue-100 mt-8">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center mb-12">
          <Mail className="w-16 h-16 text-black mb-4" />
          <h2 className="text-center text-black text-3xl font-bold">
            Recommended Resources
          </h2>
          <a
            href="mailto:15minuteemailservice@gmail.com"
            className="mt-4 flex items-center text-black hover:text-gray-700 space-x-2"
          >
            <Mail className="w-4 h-4" />
            <span>15minuteemailservice@gmail.com</span>
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {affiliateLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group flex flex-col items-center bg-white hover:bg-blue-50 
                rounded-xl p-6 transition-all duration-300 
                hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <div className="p-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 
                mb-4 group-hover:scale-110 transition-transform duration-300">
                {React.cloneElement(link.icon, { 
                  className: "w-6 h-6 text-white" 
                })}
              </div>
              <h3 className="text-black font-semibold text-lg mb-3 text-center">
                {link.title}
              </h3>
              <div className="flex items-center text-black hover:text-gray-700 text-sm font-medium">
                <span>Learn More</span>
                <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          ))}
        </div>
        <div className="text-center mt-16 space-y-4 border-t border-blue-200 pt-12">
          <p className="text-black text-sm font-medium">
            Affiliate Disclosure: Some links above are sponsored
          </p>
          <p className="text-black text-sm">
            © {new Date().getFullYear()} 15-Minute Email Service
          </p>
        </div>
      </div>
    </footer>
  );
}
