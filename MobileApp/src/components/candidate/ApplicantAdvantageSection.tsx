import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

// Real high-resolution professional stock photos (Guaranteed fast loading URLs)
const REAL_IMAGES = {
  verifiedEmployers: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  directHR: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80',
  multiDomain: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80';

// Robust Image Component with Fallback Handling
const SafeCardImage: React.FC<{ imageUri: string }> = ({ imageUri }) => {
  const [currentUri, setCurrentUri] = useState(imageUri);

  return (
    <View style={styles.imageBadgeBox}>
      <Image
        source={{ uri: currentUri }}
        onError={() => setCurrentUri(FALLBACK_IMAGE)}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.gradientTopTrim} />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// APPLICANT ADVANTAGE SECTION COMPONENT (100% PIXEL PERFECT ALIGNMENT & STYLE)
// ─────────────────────────────────────────────────────────────────────────────

export const ApplicantAdvantageSection: React.FC = () => {
  return (
    <View style={styles.sectionContainer}>
      {/* Subtitle Header at Top (Exact Placement as Reference Image) */}
      <Text style={styles.topSubtitleText}>
        Our platform connects verified job seekers with top enterprise, healthcare, IT, and industrial employers nationwide.
      </Text>

      {/* Staggered 2-Column Offset Layout (100% Matching Reference Image) */}
      <View style={styles.staggeredGridRow}>
        {/* Left Column: Card 1 (Top) + Card 3 (Bottom) */}
        <View style={styles.gridColumn}>
          {/* Card 1: Verified Employers */}
          <View style={styles.cardContainer}>
            <SafeCardImage imageUri={REAL_IMAGES.verifiedEmployers} />
            <View style={styles.whiteCardBox}>
              <Text style={styles.cardTitleText}>Verified Employers</Text>
              <Text style={styles.cardDescText}>
                Corporate verified organizations before publishing active job listings.
              </Text>
            </View>
          </View>

          {/* Card 3: Multi-Domain Opportunities (Below Card 1 with Clear Gap) */}
          <View style={[styles.cardContainer, { marginTop: 24 }]}>
            <SafeCardImage imageUri={REAL_IMAGES.multiDomain} />
            <View style={styles.whiteCardBox}>
              <Text style={styles.cardTitleText}>Multi-Domain Opportunities</Text>
              <Text style={styles.cardDescText}>
                Explore vacancies matched to your skills, trade, and location.
              </Text>
            </View>
          </View>
        </View>

        {/* Right Column: Card 2 (Offset Vertically Downward) */}
        <View style={[styles.gridColumn, { paddingTop: 64 }]}>
          {/* Card 2: Direct HR Connect */}
          <View style={styles.cardContainer}>
            <SafeCardImage imageUri={REAL_IMAGES.directHR} />
            <View style={styles.whiteCardBox}>
              <Text style={styles.cardTitleText}>Direct HR Connect</Text>
              <Text style={styles.cardDescText}>
                Track application status in real time with direct HR communication.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLESHEET (100% PIXEL PERFECT ALIGNMENT & AGENTS.md RULES)
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  sectionContainer: {
    paddingVertical: 12,
    marginVertical: 8,
    alignItems: 'center',
  },
  topSubtitleText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 340,
    marginBottom: 20,
  },

  /* Staggered 2-Column Offset Grid */
  staggeredGridRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  gridColumn: {
    flex: 1,
  },

  /* Rock-Solid Card Container with Floating Badge Overflow */
  cardContainer: {
    width: '100%',
    alignItems: 'center',
  },
  imageBadgeBox: {
    width: '92%',
    height: 94,
    borderRadius: RADIUS.card,
    borderWidth: 2,
    borderColor: '#93C5FD',
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    marginBottom: -34,
    zIndex: 10,
    alignSelf: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  gradientTopTrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
  },
  whiteCardBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: RADIUS.card,
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  cardDescText: {
    fontSize: 11,
    fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 15,
  },
});

export default ApplicantAdvantageSection;
