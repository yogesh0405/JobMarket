import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { Maximize2, Minimize2, Navigation, RotateCcw } from 'lucide-react';
import { JobPopupCard } from './JobPopupCard';
import { createRoot } from 'react-dom/client';
import { getCompanyLogo } from '../../utils/companyLogos';
import { BrowserRouter } from 'react-router-dom';


interface InteractiveJobMapProps {
  jobs: any[];
  activeJobId: string | null;
  onSelectJob: (job: any) => void;
  onBoundsChange: (bounds: { north: number; south: number; east: number; west: number }) => void;
  userCoordinates?: { latitude: number; longitude: number } | null;
  onSaveJob?: (jobId: string) => void;
  savedJobIds?: string[];
}

// Default Map Center: Chhatrapati Sambhajinagar (Aurangabad) Industrial Belt
const DEFAULT_CENTER: [number, number] = [19.8762, 75.3433];
const DEFAULT_ZOOM = 12;

export const InteractiveJobMap: React.FC<InteractiveJobMapProps> = ({
  jobs,
  activeJobId,
  onSelectJob,
  onBoundsChange,
  userCoordinates,
  onSaveJob,
  savedJobIds = []
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());
  const popupRootsRef = useRef<Map<string, any>>(new Map());
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true
    });

    // Add OpenStreetMap Tile Layer (100% Free)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Add Scale Control
    L.control.scale({ imperial: false, metric: true }).addTo(map);

    // Initialize Marker Cluster Group
    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = 36;
        if (count > 50) size = 48;
        else if (count > 20) size = 42;

        return L.divIcon({
          html: `<div style="width:${size}px; height:${size}px;" class="custom-cluster-icon">${count}</div>`,
          className: 'custom-cluster-wrapper',
          iconSize: [size, size]
        });
      }
    });

    map.addLayer(clusterGroup);

    mapInstanceRef.current = map;
    clusterGroupRef.current = clusterGroup;

    // Invalidate size on mount and container resize to prevent grey tiles / unresponsive canvas
    const invalidate = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      invalidate();
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    // Notify initial bounds
    const notifyBounds = () => {
      if (!mapInstanceRef.current) return;
      const b = mapInstanceRef.current.getBounds();
      onBoundsChange({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest()
      });
    };

    map.on('moveend zoomend', notifyBounds);

    // Trigger initial size invalidation & bounds calculation after DOM layout stabilizes
    setTimeout(() => {
      invalidate();
      notifyBounds();
    }, 200);

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers on Map when jobs list changes
  useEffect(() => {
    if (!mapInstanceRef.current || !clusterGroupRef.current) return;

    const clusterGroup = clusterGroupRef.current;
    clusterGroup.clearLayers();
    markerMapRef.current.clear();

    jobs.forEach((job) => {
      if (!job.latitude || !job.longitude) return;

      const isSaved = savedJobIds.includes(job.id);
      const isActive = job.id === activeJobId;

      // Custom Marker Pin HTML — validate logo URL using companyLogos utility
      const logoUrl = (job.companyLogo && job.companyLogo.length > 5 && (job.companyLogo.startsWith('http') || job.companyLogo.startsWith('data:image')))
        ? job.companyLogo
        : getCompanyLogo(job.company, job.companyColor);
      const logoHtml = `<img src="${logoUrl}" class="custom-map-marker-icon" alt="${job.company}" onError="this.onerror=null;this.src='${getCompanyLogo(job.company, job.companyColor)}'" />`;


      const customIcon = L.divIcon({
        className: 'custom-marker-wrapper',
        html: `<div class="custom-map-marker ${isActive ? 'active' : ''}">${logoHtml}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
      });

      const marker = L.marker([job.latitude, job.longitude], { icon: customIcon });

      // Create Popup Container
      const popupDiv = document.createElement('div');
      const root = createRoot(popupDiv);
      root.render(
        <BrowserRouter>
          <JobPopupCard
            job={job}
            onSaveJob={onSaveJob}
            isSaved={isSaved}
          />
        </BrowserRouter>
      );

      marker.bindPopup(popupDiv, { maxWidth: 300 });

      marker.on('click', () => {
        onSelectJob(job);
      });

      clusterGroup.addLayer(marker);
      markerMapRef.current.set(job.id, marker);
    });
  }, [jobs, activeJobId, savedJobIds, onSaveJob, onSelectJob]);

  // Handle active job selection -> pan map & open popup
  useEffect(() => {
    if (!activeJobId || !mapInstanceRef.current) return;
    const marker = markerMapRef.current.get(activeJobId);
    if (marker) {
      const latLng = marker.getLatLng();
      mapInstanceRef.current.setView(latLng, Math.max(mapInstanceRef.current.getZoom(), 13), {
        animate: true,
        duration: 0.5
      });
      setTimeout(() => {
        marker.openPopup();
      }, 300);
    }
  }, [activeJobId]);

  // Handle User Location changes
  useEffect(() => {
    if (userCoordinates && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userCoordinates.latitude, userCoordinates.longitude], 13, {
        animate: true
      });
      // Add user location blue dot marker
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div style="width:20px; height:20px; border-radius:50%; background:#344BFD; border:3px solid #ffffff; box-shadow:0 0 12px rgba(52,75,253,0.8); animation:pulse 2s infinite;"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      L.marker([userCoordinates.latitude, userCoordinates.longitude], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('<b>Your Current Location</b>')
        .openPopup();
    }
  }, [userCoordinates]);

  // Fit All Markers Handler
  const handleFitBounds = () => {
    if (!mapInstanceRef.current || jobs.length === 0) return;
    const validJobs = jobs.filter((j) => j.latitude && j.longitude);
    if (validJobs.length === 0) return;

    const bounds = L.latLngBounds(validJobs.map((j) => [j.latitude, j.longitude]));
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14, animate: true });
  };

  // Reset View Handler
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: true });
    }
  };

  // Fullscreen Toggle Handler
  const handleToggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.parentElement?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="map-canvas-container">
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Custom Map Action Overlay Controls */}
      <div className="map-action-overlay">
        <button
          className="map-control-btn"
          onClick={handleFitBounds}
          title="Fit Map to All Visible Job Markers"
        >
          <Navigation size={18} />
        </button>

        <button
          className="map-control-btn"
          onClick={handleResetView}
          title="Reset Map View to Chhatrapati Sambhajinagar"
        >
          <RotateCcw size={18} />
        </button>

        <button
          className="map-control-btn"
          onClick={handleToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>
    </div>
  );
};
