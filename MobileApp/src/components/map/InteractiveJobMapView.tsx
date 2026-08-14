import { COLORS } from '../../constants/theme';
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  Briefcase,
  ChevronUp,
  ChevronDown,
  Navigation,
  RotateCcw,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Building2,
  ExternalLink,
  ChevronDown as ArrowDownIcon,
  Send,
} from 'lucide-react-native';
import { Job } from '../../types';
import { getCompanyLogoUrl } from '../../utils/companyLogos';

interface InteractiveJobMapViewProps {
  jobs: Job[];
  activeJobId?: string | null;
  onSelectJob?: (job: Job) => void;
  navigation: any;
  onSaveJob?: (jobId: string) => void;
  savedJobIds?: string[];
}

const DEFAULT_CENTER = { lat: 19.8762, lng: 75.3433 }; // Chhatrapati Sambhajinagar

export const InteractiveJobMapView: React.FC<InteractiveJobMapViewProps> = ({
  jobs,
  activeJobId,
  onSelectJob,
  navigation,
}) => {
  const webViewRef = useRef<WebView | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [nearbyCount, setNearbyCount] = useState(jobs.length);
  const [visibleJobIds, setVisibleJobIds] = useState<string[]>([]);
  const [distanceFilter, setDistanceFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Prepare map jobs with precise Sambhajinagar coordinates & corporate logos
  const mapJobs = jobs.map((job, idx) => {
    // Generate deterministic coordinate offsets around Sambhajinagar industrial hubs if lat/lng are null
    const baseLat = 19.8762 + ((((idx * 17) % 50) - 25) * 0.0035);
    const baseLng = 75.3433 + ((((idx * 23) % 50) - 25) * 0.0042);

    const rawLogo = job.companyLogo || (job as any).company_logo || (job as any).logoUrl || (job as any).logo_url || (job as any).logo;
    const logoUrl = getCompanyLogoUrl(job.company || 'Enterprise', rawLogo);

    return {
      id: job.id,
      title: job.title,
      company: job.company || 'Industrial Company',
      location: job.location || 'Chhatrapati Sambhajinagar',
      salaryMin: job.salary_min ?? (job as any).salaryMin ?? 15000,
      salaryMax: job.salary_max ?? (job as any).salaryMax ?? 30000,
      jobType: job.job_type || (job as any).jobType || 'Full-time',
      workMode: job.work_mode || (job as any).workMode || 'On-site',
      logoUrl: logoUrl,
      latitude: Number(job.latitude) || baseLat,
      longitude: Number(job.longitude) || baseLng,
    };
  });

  // Filter jobs based on selected map pills
  const filteredMapJobs = mapJobs.filter((j) => {
    if (modeFilter !== 'All' && !j.workMode.toLowerCase().includes(modeFilter.toLowerCase())) return false;
    if (typeFilter !== 'All' && !j.jobType.toLowerCase().includes(typeFilter.toLowerCase())) return false;
    return true;
  });

  // Inject 100% Identical Web Application Leaflet & MarkerCluster Engine
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body, #map { width: 100%; height: 100%; background: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          
          /* Cluster Circular Badges - 100% Identical to Web Application Screenshot */
          .custom-cluster-wrapper {
            background: transparent;
          }
          .custom-cluster-icon {
            background: #3b82f6;
            color: #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 15px;
            border: 3px solid rgba(255, 255, 255, 0.95);
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.45);
            text-align: center;
          }

          /* Single Pin Dot (No text labels) */
          .custom-single-pin-wrapper {
            background: transparent;
          }
          .custom-single-pin {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: #ffffff;
            border: 2.5px solid #2563eb;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            transition: transform 0.2s ease;
          }
          .custom-single-pin.selected {
            transform: scale(1.2);
            border-color: #facc15;
            box-shadow: 0 6px 18px rgba(250, 204, 21, 0.6);
          }
          .single-pin-logo {
            width: 26px;
            height: 26px;
            border-radius: 50%;
            object-fit: cover;
          }

          /* Leaflet Popup Override - Identical to Web App Popup Card */
          .leaflet-popup-content-wrapper {
            padding: 0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.25);
          }
          .leaflet-popup-content {
            margin: 0;
            width: 250px !important;
          }
          .popup-card {
            padding: 12px;
            background: #ffffff;
          }
          .popup-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
          }
          .popup-logo {
            width: 38px;
            height: 38px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            object-fit: contain;
            background: #ffffff;
          }
          .popup-title {
            font-size: 13.5px;
            font-weight: 800;
            color: #0f172a;
            line-height: 1.2;
            margin-bottom: 2px;
          }
          .popup-company {
            font-size: 11.5px;
            color: #64748b;
            font-weight: 600;
          }
          .popup-location {
            font-size: 11.5px;
            color: #475569;
            margin-bottom: 8px;
            font-weight: 600;
          }
          .popup-salary {
            font-size: 12px;
            color: #16a34a;
            font-weight: 800;
            margin-bottom: 10px;
          }
          .popup-btn {
            width: 100%;
            padding: 9px;
            background: #2563EB;
            color: #ffffff;
            border: none;
            border-radius: 6px;
            font-size: 12.5px;
            font-weight: 800;
            cursor: pointer;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const jobsData = ${JSON.stringify(filteredMapJobs)};
          const defaultCenter = [${DEFAULT_CENTER.lat}, ${DEFAULT_CENTER.lng}];

          const map = L.map('map', {
            center: defaultCenter,
            zoom: 12,
            zoomControl: false,
            attributionControl: false
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);

          // Leaflet MarkerCluster Group with Custom Count Badges
          const clusterGroup = L.markerClusterGroup({
            chunkedLoading: true,
            maxClusterRadius: 40,
            iconCreateFunction: function(cluster) {
              const count = cluster.getChildCount();
              let size = 38;
              if (count > 50) size = 50;
              else if (count > 20) size = 44;

              return L.divIcon({
                html: '<div class="custom-cluster-icon" style="width:' + size + 'px; height:' + size + 'px; line-height:' + (size - 6) + 'px;">' + count + '</div>',
                className: 'custom-cluster-wrapper',
                iconSize: [size, size]
              });
            }
          });

          const markersMap = {};
          const fallbackBadgeSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%232563EB'/><path d='M30 75 V40 L50 25 L70 40 V75 Z' fill='none' stroke='%23FFFFFF' stroke-width='6'/><rect x='42' y='55' width='16' height='20' fill='%23FFFFFF'/></svg>";

          jobsData.forEach(job => {
            const logoUrl = (job.logoUrl && job.logoUrl.trim().length > 5) ? job.logoUrl.trim() : fallbackBadgeSvg;
            const pinHtml = '<div id="pin-' + job.id + '" class="custom-single-pin"><img class="single-pin-logo" src="' + logoUrl + '" onError="this.src=\\' font-size:0; ' + fallbackBadgeSvg + '\\'" /></div>';

            const customIcon = L.divIcon({
              html: pinHtml,
              className: 'custom-single-pin-wrapper',
              iconSize: [34, 34],
              iconAnchor: [17, 17]
            });

            const marker = L.marker([job.latitude, job.longitude], { icon: customIcon });

            const salaryText = '₹' + (job.salaryMin / 100000).toFixed(1) + ' - ₹' + (job.salaryMax / 100000).toFixed(1) + ' Lacs/yr';

            const popupContent = \`
              <div class="popup-card">
                <div class="popup-header">
                  <img class="popup-logo" src="\${logoUrl}" />
                  <div>
                    <div class="popup-title">\${job.title}</div>
                    <div class="popup-company">\${job.company}</div>
                  </div>
                </div>
                <div class="popup-location">📍 \${job.location}</div>
                <div class="popup-salary">\${salaryText}</div>
                <button class="popup-btn" onclick="window.ReactNativeWebView.postMessage(JSON.stringify({type:'NAVIGATE_JOB', jobId:'\${job.id}'}))">
                  View Vacancy Details
                </button>
              </div>
            \`;

            marker.bindPopup(popupContent);

            marker.on('click', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_JOB', jobId: job.id }));
            });

            clusterGroup.addLayer(marker);
            markersMap[job.id] = marker;
          });

          map.addLayer(clusterGroup);

          // Update Bounds & Nearby Count in Real Time when view/zoom moves
          function notifyBoundsUpdated() {
            const bounds = map.getBounds();
            const visible = jobsData.filter(j => 
              j.latitude >= bounds.getSouth() &&
              j.latitude <= bounds.getNorth() &&
              j.longitude >= bounds.getWest() &&
              j.longitude <= bounds.getEast()
            );

            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'BOUNDS_UPDATED',
              count: visible.length,
              jobIds: visible.map(v => v.id)
            }));
          }

          map.on('moveend zoomend', notifyBoundsUpdated);
          setTimeout(notifyBoundsUpdated, 300);

          // Window Helpers exposed to React Native
          window.recenterMap = function() {
            map.setView(defaultCenter, 12, { animate: true });
          };

          window.zoomInMap = function() {
            map.zoomIn();
          };

          window.zoomOutMap = function() {
            map.zoomOut();
          };

          window.selectJobPin = function(jobId, lat, lng) {
            if (markersMap[jobId]) {
              map.setView([lat, lng], 15, { animate: true });
              markersMap[jobId].openPopup();
            }
          };
        </script>
      </body>
    </html>
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'BOUNDS_UPDATED') {
        setNearbyCount(data.count);
        setVisibleJobIds(data.jobIds || []);
      } else if (data.type === 'SELECT_JOB') {
        const found = jobs.find((j) => j.id === data.jobId);
        if (found) {
          setSelectedJob(found);
          if (onSelectJob) onSelectJob(found);
        }
      } else if (data.type === 'NAVIGATE_JOB') {
        navigation.navigate('CandidateJobDetail', { jobId: data.jobId });
      }
    } catch (err) {}
  };

  const handleRecenter = () => {
    webViewRef.current?.injectJavaScript('window.recenterMap(); true;');
  };

  const handleZoomIn = () => {
    webViewRef.current?.injectJavaScript('window.zoomInMap(); true;');
  };

  const handleZoomOut = () => {
    webViewRef.current?.injectJavaScript('window.zoomOutMap(); true;');
  };

  const handleSelectJobFromSheet = (job: Job) => {
    setSelectedJob(job);
    if (onSelectJob) onSelectJob(job);
    const mapItem = mapJobs.find((m) => m.id === job.id);
    if (mapItem) {
      webViewRef.current?.injectJavaScript(
        `window.selectJobPin("${job.id}", ${mapItem.latitude}, ${mapItem.longitude}); true;`
      );
    }
  };

  // Filter jobs to display in bottom sheet (matching visible bounds)
  const visibleSheetJobs = jobs.filter((j) =>
    visibleJobIds.length > 0 ? visibleJobIds.includes(j.id) : true
  );

  return (
    <View style={styles.container}>
      {/* Leaflet Interactive Map Canvas */}
      <View style={styles.mapCanvasWrapper}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          javaScriptEnabled
          domStorageEnabled
        />

        {/* Left Map Controls (+ / - Zoom Buttons) */}
        <View style={styles.leftMapControls}>
          <TouchableOpacity style={styles.mapControlBtn} onPress={handleZoomIn} activeOpacity={0.8}>
            <ZoomIn size={16} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.controlDivider} />
          <TouchableOpacity style={styles.mapControlBtn} onPress={handleZoomOut} activeOpacity={0.8}>
            <ZoomOut size={16} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Right Map Controls (Location / Recenter / Fullscreen) */}
        <View style={styles.rightMapControls}>
          <TouchableOpacity style={styles.mapControlBtn} onPress={handleRecenter} activeOpacity={0.8}>
            <Navigation size={16} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.controlDivider} />
          <TouchableOpacity style={styles.mapControlBtn} onPress={handleRecenter} activeOpacity={0.8}>
            <RotateCcw size={16} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.controlDivider} />
          <TouchableOpacity style={styles.mapControlBtn} onPress={handleRecenter} activeOpacity={0.8}>
            <Maximize2 size={16} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sheet Drawer (Matching Web App Screenshot 100%) */}
      <View style={[styles.bottomSheet, sheetExpanded && styles.bottomSheetExpanded]}>
        <TouchableOpacity
          style={styles.sheetHeaderTouch}
          onPress={() => setSheetExpanded(!sheetExpanded)}
          activeOpacity={0.9}
        >
          <View style={styles.sheetHandlePill} />

          <View style={styles.sheetHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.briefcaseIconBadge}>
                <Briefcase size={16} color={COLORS.primary} />
              </View>

              <Text style={styles.sheetTitleText}>Jobs Nearby</Text>

              {/* Dynamic Updated Nearby Count Badge Pill */}
              <View style={styles.nearbyCountBadge}>
                <Text style={styles.nearbyCountText}>{nearbyCount}</Text>
              </View>
            </View>

            <View style={styles.chevronToggleBtn}>
              {sheetExpanded ? (
                <ChevronDown size={18} color="#64748B" />
              ) : (
                <ChevronUp size={18} color="#64748B" />
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Scrollable Job List inside Bottom Sheet */}
        <ScrollView
          style={styles.sheetBody}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {visibleSheetJobs.slice(0, 30).map((job) => {
            const isSelected = selectedJob?.id === job.id;
            const logoUrl = job.companyLogo || (job as any).company_logo;

            return (
              <TouchableOpacity
                key={job.id}
                activeOpacity={0.85}
                style={[styles.sheetJobCard, isSelected && styles.sheetJobCardActive]}
                onPress={() => handleSelectJobFromSheet(job)}
              >
                <View style={styles.cardLeftLogoSquare}>
                  {logoUrl ? (
                    <Image source={{ uri: logoUrl }} style={styles.cardLogoImg} resizeMode="contain" />
                  ) : (
                    <Building2 size={20} color={COLORS.primary} />
                  )}
                </View>

                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.cardJobTitle} numberOfLines={1}>
                    {job.title}
                  </Text>
                  <Text style={styles.cardCompanyText} numberOfLines={1}>
                    {job.company || 'Industrial Company'} • {job.location || 'Chhatrapati Sambhajinagar'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
                    <Text style={styles.cardSalaryBadge}>
                      ₹{(job.salary_min ?? (job as any).salaryMin ?? 15000).toLocaleString('en-IN')} - ₹{(job.salary_max ?? (job as any).salaryMax ?? 30000).toLocaleString('en-IN')}/yr
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.viewDetailArrowBtn}
                  onPress={() => navigation.navigate('CandidateJobDetail', { jobId: job.id })}
                >
                  <ExternalLink size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topFilterPillsBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterPillsRow: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillDropdownText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  pillNearbyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillNearbyText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mapCanvasWrapper: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  leftMapControls: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  rightMapControls: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  mapControlBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  bottomSheetExpanded: {
    height: Dimensions.get('window').height * 0.62,
  },
  sheetHeaderTouch: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  sheetHandlePill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 8,
  },
  sheetHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  briefcaseIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitleText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  nearbyCountBadge: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
  },
  nearbyCountText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
  },
  chevronToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBody: {
    flex: 1,
    marginTop: 6,
  },
  sheetJobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 8,
  },
  sheetJobCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  cardLeftLogoSquare: {
    width: 40,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardLogoImg: {
    width: '100%',
    height: '100%',
  },
  cardJobTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardCompanyText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  cardSalaryBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },
  viewDetailArrowBtn: {
    padding: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
});
