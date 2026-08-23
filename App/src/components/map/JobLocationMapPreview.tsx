import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Target, ZoomIn, ZoomOut } from 'lucide-react';

interface JobLocationMapPreviewProps {
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string;
  height?: string;
  readOnly?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
}

export const JobLocationMapPreview: React.FC<JobLocationMapPreviewProps> = ({
  latitude,
  longitude,
  locationName = 'Job Location',
  height = '280px',
  readOnly = false,
  onLocationSelect
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const safeLat = (typeof latitude === 'number' && !isNaN(latitude) && latitude !== 0) ? latitude : 19.8762;
  const safeLng = (typeof longitude === 'number' && !isNaN(longitude) && longitude !== 0) ? longitude : 75.3433;

  // Custom Pin Marker Icon (Clean Vector SVG)
  const createPinIcon = () => {
    const svgIcon = `
      <svg width="34" height="44" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.37258 0 0 5.37258 0 12C0 21 12 34 12 34C12 34 24 21 24 12C24 5.37258 18.6274 0 12 0Z" fill="#344BFD"/>
        <circle cx="12" cy="12" r="5" fill="#FFFFFF"/>
      </svg>
    `;
    return L.divIcon({
      html: svgIcon,
      className: 'custom-location-pin-marker',
      iconSize: [34, 44],
      iconAnchor: [17, 44],
      popupAnchor: [0, -40]
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map instance centered at [safeLat, safeLng]
      const map = L.map(mapContainerRef.current, {
        center: [safeLat, safeLng],
        zoom: 15,
        zoomControl: false,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        dragging: true
      });

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Add marker pin (draggable if not readOnly or onLocationSelect provided)
      const isDraggable = !readOnly || !!onLocationSelect;
      const marker = L.marker([safeLat, safeLng], {
        icon: createPinIcon(),
        draggable: isDraggable
      }).addTo(map);

      if (isDraggable) {
        marker.on('dragend', () => {
          const latLng = marker.getLatLng();
          if (onLocationSelect) {
            onLocationSelect(latLng.lat, latLng.lng);
          }
        });

        map.on('click', (e: L.LeafletMouseEvent) => {
          marker.setLatLng(e.latlng);
          if (onLocationSelect) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
          }
        });
      }

      marker.bindPopup(`
        <div style="font-family: inherit; padding: 6px 8px; text-align: center; min-width: 140px;">
          <strong style="color: #0f172a; font-size: 13px; display: block; margin-bottom: 2px;">Pinned Location</strong>
          <div style="font-size: 12px; color: #334155; font-weight: 600; margin-bottom: 4px;">${locationName}</div>
          <div style="font-size: 11px; color: #2563eb; font-weight: 700; background: #eff6ff; padding: 3px 6px; borderRadius: 4px; display: inline-block;">
            📍 ${safeLat.toFixed(6)}, ${safeLng.toFixed(6)}
          </div>
        </div>
      `);

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate size on resize to avoid grey tile glitches
      const resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    } else {
      // Update existing map and marker position smoothly
      const map = mapInstanceRef.current;
      map.setView([safeLat, safeLng], map.getZoom());
      if (markerRef.current) {
        markerRef.current.setLatLng([safeLat, safeLng]);
        markerRef.current.getPopup()?.setContent(`
          <div style="font-family: inherit; padding: 6px 8px; text-align: center; min-width: 140px;">
            <strong style="color: #0f172a; font-size: 13px; display: block; margin-bottom: 2px;">Pinned Location</strong>
            <div style="font-size: 12px; color: #334155; font-weight: 600; margin-bottom: 4px;">${locationName}</div>
            <div style="font-size: 11px; color: #2563eb; font-weight: 700; background: #eff6ff; padding: 3px 6px; borderRadius: 4px; display: inline-block;">
              📍 ${safeLat.toFixed(6)}, ${safeLng.toFixed(6)}
            </div>
          </div>
        `);
      }
      map.invalidateSize();
    }
  }, [safeLat, safeLng, locationName, readOnly, onLocationSelect]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], 15, { animate: true });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  return (
    <div style={{
      marginTop: '12px',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1.5px solid #CBD5E1',
      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
      background: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header bar showing Location Marked text and controls */}
      <div style={{
        padding: '10px 14px',
        background: '#F8FAFC',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            background: '#EFF6FF',
            color: '#344BFD'
          }}>
            <MapPin size={16} />
          </div>
          <span>Location</span>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '500', marginLeft: '2px' }}>(View & Zoom Only)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <ZoomOut size={14} />
          </button>
          <button
            type="button"
            onClick={handleRecenter}
            style={{
              padding: '4px 10px',
              height: '28px',
              borderRadius: '6px',
              border: '1px solid #344BFD',
              background: '#EFF6FF',
              color: '#1D4ED8',
              fontSize: '11.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            <Target size={13} />
            <span>Recenter</span>
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height: height, 
          background: '#E2E8F0',
          position: 'relative',
          zIndex: 1
        }} 
      />
    </div>
  );
};
