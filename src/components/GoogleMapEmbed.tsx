'use client';

import React from 'react';

interface GoogleMapEmbedProps {
  className?: string;
}

const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({
  className = "w-full h-64 rounded-lg"
}) => {
  // Vine Church KWC address: 417 King St W, Kitchener, ON N2G 1C2
  // Using the actual church's Google Maps embed URL
  const embedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2896.3259847668936!2d-80.49186892395508!3d43.452229071114205!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882bf3f2e7f9b7d7%3A0x5045f7c0b29a930!2s417%20King%20St%20W%2C%20Kitchener%2C%20ON%20N2G%201C2!5e0!3m2!1sen!2sca!4v1735761600000!5m2!1sen!2sca";

  return (
    <iframe
      src={embedUrl}
      className={className}
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Vine Church KWC Location"
    />
  );
};

export default GoogleMapEmbed;