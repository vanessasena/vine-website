'use client';

import React from 'react';

interface GoogleMapEmbedProps {
  className?: string;
}

const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({
  className = "w-full h-64 rounded-lg"
}) => {
  // Vine Church KWC address: 55 Dickson Street, 8 Petty Pl, Cambridge, ON N1R 7A5
  // Using the actual church's Google Maps embed URL
  const embedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2900.8361558702654!2d-80.31734651584247!3d43.359537696917926!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882bf4c2b9ebfffd%3A0x357a9e8e9edf2683!2sVine%20Church%20-%20Brazilian%20Church!5e0!3m2!1sen!2sca!4v1763149489074!5m2!1sen!2sca";

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