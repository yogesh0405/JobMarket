import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { MapPin, Target, Navigation2, ExternalLink } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

interface JobLocationMapPreviewProps {
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string;
  height?: number;
}

export const JobLocationMapPreview: React.FC<JobLocationMapPreviewProps> = ({
  latitude,
  longitude,
  locationName = 'Industrial Job Location',
  height = 240,
}) => {
  const webViewRef = useRef<WebView | null>(null);

  const hasValidCoords =
    latitude !== null &&
    latitude !== undefined &&
    longitude !== null &&
    longitude !== undefined &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    !(latitude === 0 && longitude === 0);

  if (!hasValidCoords) {
    return (
      <View style={[styles.cardContainer, styles.placeholderContainer, { minHeight: 140 }]}>
        <View style={styles.placeholderIconBox}>
          <MapPin size={24} color="#64748B" />
        </View>
        <Text style={styles.placeholderTitle}>Real Location Pin Preview</Text>
        <Text style={styles.placeholderSub}>
          Enter address or Google Maps URL and tap "Fetch & Pin Map Location" to display the live GPS pin.
        </Text>
      </View>
    );
  }

  const lat = latitude;
  const lng = longitude;

  const handleOpenGoogleMaps = () => {
    const queryStr = locationName ? `${locationName}, ${lat},${lng}` : `${lat},${lng}`;
    const mapsUrl =
      Platform.OS === 'ios'
        ? `https://maps.apple.com/?q=${encodeURIComponent(queryStr)}&ll=${lat},${lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryStr)}`;

    Linking.openURL(mapsUrl).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
    });
  };

  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #e2e8f0;
          }
          #map {
            width: 100%;
            height: 100%;
            min-height: 200px;
            background: #e2e8f0;
          }
          .custom-pin-marker {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const lat = ${lat};
          const lng = ${lng};
          const locName = "${(locationName || 'Job Location').replace(/"/g, '\\"').replace(/\n/g, ' ')}";

          const map = L.map('map', {
            center: [lat, lng],
            zoom: 15,
            zoomControl: false,
            scrollWheelZoom: true,
            dragging: true,
            touchZoom: true
          });

          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap',
            maxZoom: 19
          }).addTo(map);

          setTimeout(function() {
            map.invalidateSize();
          }, 300);

          const svgPin = \`
            <svg width="34" height="44" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.37258 0 0 5.37258 0 12C0 21 12 34 12 34C12 34 24 21 24 12C24 5.37258 18.6274 0 12 0Z" fill="#2563EB"/>
              <circle cx="12" cy="12" r="5" fill="#FFFFFF"/>
            </svg>
          \`;

          const pinIcon = L.divIcon({
            html: svgPin,
            className: 'custom-pin-marker',
            iconSize: [34, 44],
            iconAnchor: [17, 44],
            popupAnchor: [0, -40]
          });

          const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
          marker.bindPopup("<strong style='color:#0f172a;'>Factory Location</strong><br/><span style='font-size:12px;color:#2563eb;'>Tap to Open Maps 🧭</span>").openPopup();

          marker.on('click', function() {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage("openMaps");
            }
          });

          map.on('click', function() {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage("openMaps");
            }
          });

          document.addEventListener("message", function(event) {
            if (event.data === "recenter") {
              map.setView([lat, lng], 15, { animate: true });
            }
          });
          window.addEventListener("message", function(event) {
            if (event.data === "recenter") {
              map.setView([lat, lng], 15, { animate: true });
            }
          });
        </script>
      </body>
    </html>
  `;

  const handleRecenter = () => {
    if (webViewRef.current) {
      webViewRef.current.postMessage('recenter');
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Header bar matching web app */}
      <View style={styles.headerBar}>
        <View style={styles.headerTitleBox}>
          <View style={styles.iconBox}>
            <MapPin size={15} color={COLORS.primary} />
          </View>
          <Text style={styles.headerTitle}>Location</Text>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.recenterBtn} activeOpacity={0.7} onPress={handleRecenter}>
            <Target size={12} color="#475569" />
            <Text style={styles.recenterText}>Recenter</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navigateNavBtn} activeOpacity={0.8} onPress={handleOpenGoogleMaps}>
            <Navigation2 size={13} color="#FFFFFF" />
            <Text style={styles.navigateNavText}>Navigate</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Interactive Leaflet WebView Canvas */}
      <View style={[styles.mapWrapper, { height }]}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: mapHtml, baseUrl: 'https://unpkg.com' }}
          style={{ flex: 1 }}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mixedContentMode="always"
          androidLayerType="hardware"
          onMessage={(event) => {
            if (event.nativeEvent.data === 'openMaps') {
              handleOpenGoogleMaps();
            }
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginTop: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B4C3D4',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recenterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  recenterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  navigateNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  navigateNavText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mapWrapper: {
    width: '100%',
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  openMapsBottomBar: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  openMapsBottomText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
  },
  placeholderIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  placeholderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  placeholderSub: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 16,
  },
});
