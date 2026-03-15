import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Report {
  _id: string;
  disease_name: string;
  latitude: number;
  longitude: number;
  severity: string;
  timestamp: number;
  description?: string;
}

interface Props {
  userLocation: [number, number];
  reports: Report[];
  centerOnReport?: [number, number] | null;
}

const getSeverityColor = (severity: string) => {
  if (severity === 'Severe') return '#ef4444';
  if (severity === 'Mild') return '#22c55e';
  return '#f97316';
};

const DiseaseMap: React.FC<Props> = ({ userLocation, reports, centerOnReport }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Initialize map only once after mount
  useEffect(() => {
    // Prevent double-init (React StrictMode)
    if (mapRef.current) return;

    const map = L.map('diseaseMap', {
      center: userLocation,
      zoom: 13,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // User location marker with pulsing blue dot
    const userIcon = L.divIcon({
      className: '',
      html: `<div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:36px;height:36px;border-radius:50%;background:rgba(59,130,246,0.2);animation:hub-ping 2s ease-in-out infinite;"></div>
        <div style="width:14px;height:14px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 16px rgba(59,130,246,0.9);z-index:1;"></div>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    L.marker(userLocation, { icon: userIcon })
      .addTo(map)
      .bindPopup('<b style="font-family:Outfit,sans-serif;color:#3b82f6">📍 Your Location</b>');

    // Layer group for disease markers
    const markers = L.layerGroup().addTo(map);
    markersRef.current = markers;
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // only on mount

  // Update disease markers when reports change
  useEffect(() => {
    if (!markersRef.current) return;

    markersRef.current.clearLayers();

    reports.forEach((report) => {
      const color = getSeverityColor(report.severity);
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          background:${color};
          width:16px;height:16px;
          border-radius:50%;
          border:3px solid white;
          box-shadow:0 0 0 3px ${color}40, 0 2px 10px ${color}99;
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const popup = `
        <div style="font-family:'Outfit',sans-serif;padding:10px;min-width:180px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <b style="font-size:14px;color:#0f172a">${report.disease_name}</b>
            <span style="
              padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;
              text-transform:uppercase;
              background:${report.severity === 'Severe' ? '#fee2e2' : report.severity === 'Mild' ? '#dcfce7' : '#fff7ed'};
              color:${color};
            ">${report.severity}</span>
          </div>
          ${report.description ? `<p style="margin:0 0 6px;font-size:12px;color:#64748b;font-style:italic">"${report.description}"</p>` : ''}
          <p style="margin:0;font-size:11px;color:#94a3b8;border-top:1px solid #f1f5f9;padding-top:5px;">
            🕐 ${new Date(report.timestamp * 1000).toLocaleString()}
          </p>
        </div>`;

      L.marker([report.latitude, report.longitude], { icon })
        .addTo(markersRef.current!)
        .bindPopup(popup, { maxWidth: 260 });
    });
  }, [reports]);

  // Fly to report when centerOnReport changes
  useEffect(() => {
    if (centerOnReport && mapRef.current) {
      mapRef.current.flyTo(centerOnReport, 16, { animate: true, duration: 1.2 });
    }
  }, [centerOnReport]);

  return (
    <>
      <style>{`
        @keyframes hub-ping {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(2); opacity: 0; }
        }
        #diseaseMap .leaflet-popup-content-wrapper {
          border-radius: 14px !important;
          box-shadow: 0 8px 30px rgba(0,0,0,0.12) !important;
          border: 1px solid rgba(0,0,0,0.05) !important;
          padding: 0 !important;
          overflow: hidden;
        }
        #diseaseMap .leaflet-popup-content { margin: 0 !important; }
        #diseaseMap .leaflet-control-zoom a {
          background: rgba(15,23,42,0.9) !important;
          color: white !important;
          border-color: rgba(255,255,255,0.15) !important;
          border-radius: 8px !important;
        }
        #diseaseMap .leaflet-control-zoom a:hover { background: #1e293b !important; }
        #diseaseMap .leaflet-attribution-flag { display: none; }
      `}</style>
      <div
        id="diseaseMap"
        className="dark:map-dark map-light"
        style={{
          height: '500px',
          width: '100%',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      />
    </>
  );
};

export default DiseaseMap;
