import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { Advertisement } from '../../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DEFAULT_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';

interface CandidateHomePromoSliderProps {
  promoBanners: Advertisement[];
  onBannerPress: (banner?: Advertisement) => void;
}

export const CandidateHomePromoSlider: React.FC<CandidateHomePromoSliderProps> = ({
  promoBanners,
  onBannerPress,
}) => {
  const [activePromoIndex, setActivePromoIndex] = useState(0);
  const bannerFlatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (promoBanners.length <= 1) return;
    const timer = setInterval(() => {
      setActivePromoIndex((prev) => {
        const next = (prev + 1) % promoBanners.length;
        bannerFlatListRef.current?.scrollToIndex({
          index: next,
          animated: true,
        });
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [promoBanners.length]);

  if (promoBanners.length === 0) return null;

  return (
    <View style={styles.promoSliderContainer}>
      <FlatList
        ref={bannerFlatListRef}
        data={promoBanners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => item.id || `banner-${index}`}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH - 32,
          offset: (SCREEN_WIDTH - 32) * index,
          index,
        })}
        onMomentumScrollEnd={(e) => {
          const contentOffset = e.nativeEvent.contentOffset.x;
          const viewSize = e.nativeEvent.layoutMeasurement.width;
          if (viewSize > 0) {
            const pageNum = Math.round(contentOffset / viewSize);
            setActivePromoIndex(pageNum);
          }
        }}
        renderItem={({ item }) => {
          const rawUri = item.banner_image?.trim();
          const validUri = rawUri && rawUri.length > 5 ? rawUri : DEFAULT_BANNER_IMAGE;

          return (
            <View style={[styles.promoSliderCard, { width: SCREEN_WIDTH - 32 }]}>
              <Image
                source={{ uri: validUri }}
                style={styles.promoImage}
                resizeMode="cover"
              />
              <View style={styles.promoOverlay}>
                <View style={styles.promoBadgeOrange}>
                  <Text style={styles.promoBadgeOrangeText}>
                    {(item.advertisement_type || 'PROMOTIONAL').replace('_', ' ')}
                  </Text>
                </View>
                <Text style={styles.promoTitle}>{item.title}</Text>
                {item.description ? (
                  <Text style={styles.promoDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.promoActionBtnBlue}
                  onPress={() => onBannerPress(item)}
                >
                  <Text style={styles.promoActionBtnText}>
                    {item.button_text || 'Apply Now'}
                  </Text>
                  <ArrowRight size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {promoBanners.length > 1 ? (
        <View style={styles.dotsRow}>
          {promoBanners.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                setActivePromoIndex(idx);
                bannerFlatListRef.current?.scrollToIndex({ index: idx, animated: true });
              }}
              style={[styles.dot, activePromoIndex === idx && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  promoSliderContainer: {
    marginBottom: 6,
  },
  promoSliderCard: {
    height: 168,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  promoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  promoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  promoBadgeOrange: {
    alignSelf: 'flex-start',
    backgroundColor: '#F97316',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 4,
    marginBottom: 5,
  },
  promoBadgeOrangeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  promoDesc: {
    fontSize: 12,
    color: '#E2E8F0',
    marginTop: 3,
    lineHeight: 16,
  },
  promoActionBtnBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 6.5,
    borderRadius: 6,
    marginTop: 10,
  },
  promoActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: 16,
    backgroundColor: '#2563EB',
  },
});
