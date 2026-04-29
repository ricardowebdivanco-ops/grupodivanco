import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from '../../hooks';

// Configurar iconos de Leaflet (fix para Webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapLocation = ({ address = "Cl. 9 #5 60, Restrepo, Meta, Colombia", className = "" }) => {
  const { t } = useTranslation();
  // Coordenadas aproximadas de Restrepo, Meta, Colombia
  const position = [4.2599, -73.5627]; // [latitud, longitud]

  return (
    <div className={`rounded-lg overflow-hidden shadow-lg ${className}`}>
      <MapContainer
        center={position}
        zoom={17}
        style={{ height: '300px', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="text-center">
              <strong className="text-gray-800">{t('footer.mapPopup.title')}</strong>
              <br />
              <span className="text-gray-600">{address}</span>
              <br />
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
              >
                {t('footer.mapPopup.viewInGoogleMaps')}
              </a>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapLocation;
