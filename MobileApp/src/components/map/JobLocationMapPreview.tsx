import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { MapPin, Target } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

interface JobLocationMapPreviewProps {
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string;
  height?: number;
}

export const JobLocationMapPreview: React.FC<JobLocationMapPreviewProps> = ({
  latitude = 19.8762,
  longitude = 75.3433,
  locationName = 'Job Location',
  height = 240,
}) => {
  const webViewRef = useRef<WebView | null>(null);

  const lat = latitude || 19.8762;
  const lng = longitude || 75.3433;

  // HTML content rendering interactive Leaflet Map canvas identical to Web Application
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
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
          const locName = "${locationName.replace(/"/g, '\\"')}";

          const map = L.map('map', {
            center: [lat, lng],
            zoom: 15,
            zoomControl: false,
            scrollWheelZoom: true,
            dragging: true,
            touchZoom: true
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap',
            maxZoom: 19
          }).addTo(map);

          const svgPin = \`
            <svg width="34" height="44" viewBox="0 0 24 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.37258 0 0 5.37258 0 12C0 21 12 34 12 34C12 34 24 21 24 12C24 5.37258 18.6274 0 12 0Z" fill="#344BFD"/>
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
          marker.bindPopup("<strong style='color:#0f172a;'>Job Location</strong><br/><span style='font-size:12px;color:#475569;'>" + locName + "</span>").openPopup();

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
            <MapPin size={16} color={COLORS.primary} />
          </View>
          <Text style={styles.headerTitle}>Location</Text>
          <Text style={styles.headerSubtitle}>(View & Zoom Only)</Text>
        </View>

        <TouchableOpacity style={styles.recenterBtn} activeOpacity={0.7} onPress={handleRecenter}>
          <Target size={13} color="#1D4ED8" />
          <Text style={styles.recenterText}>Recenter</Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Leaflet WebView Canvas */}
      <View style={[styles.mapWrapper, { height }]}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={{ flex: 1 }}
          scrollEnabled={false}
          javaScriptEnabled
          domStorageEnabled
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginTop: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.slate300,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  headerBar: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 4,
    backgroundColor: COLORS.slate50,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
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
    ...TYPOGRAPHY.h2,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.slate900,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.slate500,
  },
  recenterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.sm - 2,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  recenterText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  mapWrapper: {
    width: '100%',
    backgroundColor: COLORS.slate200,
  },
});
