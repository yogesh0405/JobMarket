import React, { useRef, useEffect, useState } from 'react';
import {
  ScrollView,
  ScrollViewProps,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  UIManager,
  findNodeHandle,
  NativeSyntheticEvent,
  TargetedEvent,
  Dimensions,
} from 'react-native';

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  extraScrollHeight?: number;
  children: React.ReactNode;
}

export const handleFocusInput = (
  event: NativeSyntheticEvent<TargetedEvent> | any,
  scrollRef: React.RefObject<ScrollView | null>,
  extraScrollMargin = 24
) => {
  const node = event?.nativeEvent?.target || event?.target;
  if (!node || !scrollRef?.current) return;

  setTimeout(() => {
    try {
      const reactTag = findNodeHandle(node as any);
      const scrollTag = findNodeHandle(scrollRef.current);
      if (reactTag && scrollTag) {
        UIManager.measureLayout(
          reactTag,
          scrollTag,
          () => {},
          (x, y, width, height) => {
            UIManager.measure(
              scrollTag,
              (_sx, _sy, _sWidth, sHeight) => {
                const screenH = Dimensions.get('window').height;
                const visibleHeight = sHeight > 100 ? sHeight : screenH * 0.55;
                // Position input field comfortably just above keyboard with extraScrollMargin clearance (24px)
                // Bottom of input (y + height) will be placed at (visibleHeight - extraScrollMargin)
                const targetY = Math.max(0, y + height + extraScrollMargin - visibleHeight);
                scrollRef.current?.scrollTo({ y: targetY, animated: true });
              }
            );
          }
        );
      }
    } catch (e) {
      // Fallback
    }
  }, Platform.OS === 'ios' ? 60 : 110);
};

export const KeyboardAwareScrollView = React.forwardRef<ScrollView, KeyboardAwareScrollViewProps>(
  ({ children, extraScrollHeight = 24, contentContainerStyle, style, ...props }, ref) => {
    const internalRef = useRef<ScrollView>(null);
    const scrollRef = (ref as React.RefObject<ScrollView>) || internalRef;
    const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

    useEffect(() => {
      const showSub = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
        (e) => {
          const height = e.endCoordinates ? e.endCoordinates.height : 280;
          setKeyboardHeight(height);
        }
      );
      const hideSub = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
        () => {
          setKeyboardHeight(0);
        }
      );

      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }, []);

    const flattenedStyle = StyleSheet.flatten(contentContainerStyle) || {};
    const basePaddingBottom =
      typeof (flattenedStyle as any)?.paddingBottom === 'number'
        ? (flattenedStyle as any).paddingBottom
        : 30;

    const dynamicPaddingBottom = keyboardHeight > 0 
      ? Math.max(basePaddingBottom, extraScrollHeight + 16) 
      : basePaddingBottom;

    return (
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={[styles.scrollView, style]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          contentContainerStyle={[
            styles.scrollContent,
            contentContainerStyle,
            { paddingBottom: dynamicPaddingBottom }
          ]}
          {...props}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
);

KeyboardAwareScrollView.displayName = 'KeyboardAwareScrollView';

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
