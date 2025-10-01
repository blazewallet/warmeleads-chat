'use client';

import React from 'react';

interface StyledContentProps {
  content: string;
}

export function StyledContent({ content }: StyledContentProps) {
  // Parse content and apply styling
  const renderContent = (text: string) => {
    // Split by lines for better processing
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // Skip empty lines
      if (line.trim() === '') {
        return <br key={index} />;
      }

      // Handle pricing sections
      if (line.includes('Exclusieve Leads') || line.includes('Gedeelde Leads')) {
        return (
          <div key={index} className="bg-brand-purple/10 rounded-lg p-4 mb-4 border-l-4 border-brand-purple">
            <h4 className="font-bold text-brand-purple text-lg mb-2">{line}</h4>
          </div>
        );
      }

      // Handle bullet points with emojis or other symbols
      if (line.trim().match(/^[🌞🔋🏠❄️💼✅⚡🎯📧🛡️⏰💰🔒]/)) {
        const parts = line.trim().split(' - ');
        const emoji = line.trim().charAt(0);
        const title = parts[0]?.substring(2); // Remove emoji and space
        const description = parts[1];

        return (
          <div key={index} className="flex items-start space-x-3 mb-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl flex-shrink-0">{emoji}</span>
            <div>
              <span className="font-semibold text-brand-navy">{title}</span>
              {description && (
                <span className="text-gray-600 ml-1">- {description}</span>
              )}
            </div>
          </div>
        );
      }

      // Handle lines starting with bullet points or other symbols
      if (line.trim().match(/^[🚀⚡🎯📧•]/)) {
        const content = line.trim();
        const symbol = content.charAt(0);
        const text = content.substring(2);

        return (
          <div key={index} className="flex items-start space-x-3 mb-2 p-2 bg-gray-50 rounded-lg">
            <span className="text-lg flex-shrink-0 text-brand-pink">{symbol}</span>
            <span className="text-gray-700">{text}</span>
          </div>
        );
      }

      // Handle price lines (contains €)
      if (line.includes('€') && line.includes(':')) {
        const parts = line.split(':');
        return (
          <div key={index} className="flex justify-between items-center p-3 bg-brand-pink/10 rounded-lg mb-2">
            <span className="font-medium text-brand-navy">{parts[0]?.trim()}</span>
            <span className="font-bold text-brand-pink text-lg">{parts[1]?.trim()}</span>
          </div>
        );
      }

      // Handle success stories (quotes)
      if (line.includes('"') && line.includes('"')) {
        return (
          <blockquote key={index} className="border-l-4 border-brand-orange pl-4 py-2 mb-4 bg-brand-orange/5 rounded-r-lg">
            <p className="text-gray-700 italic text-lg leading-relaxed">{line}</p>
          </blockquote>
        );
      }

      // Handle company names (contains ** around company names)
      if (line.includes('**') && line.includes('📈')) {
        const cleanLine = line.replace(/\*\*/g, '');
        return (
          <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl mb-3 border border-green-200">
            <h5 className="font-bold text-green-700 text-lg">{cleanLine}</h5>
          </div>
        );
      }

      // Handle section headers (contains **)
      if (line.includes('**') && line.length < 50) {
        const cleanLine = line.replace(/\*\*/g, '');
        return (
          <h4 key={index} className="font-bold text-brand-purple text-xl mb-3 mt-6">
            {cleanLine}
          </h4>
        );
      }

      // Regular paragraphs
      const cleanLine = line.replace(/\*\*/g, '');
      return (
        <p key={index} className="text-gray-700 leading-relaxed mb-3">
          {cleanLine}
        </p>
      );
    });
  };

  return (
    <div className="space-y-2">
      {renderContent(content)}
    </div>
  );
}
