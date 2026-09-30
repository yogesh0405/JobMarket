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

let globalActiveKeyboardHeight = 0;

Keyboard.addListener(
  Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
  (e) => {
    globalActiveKeyboardHeight = e?.endCoordinates?.height || 280;
  }
);
Keyboard.addListener(
  Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
  () => {
    globalActiveKeyboardHeight = 0;
  }
);

export const handleFocusInput = (
  event: NativeSyntheticEvent<TargetedEvent> | any,
  scrollRef: React.RefObject<ScrollView | null>,
  extraScrollMargin = 30
) => {
  const node = event?.nativeEvent?.target || event?.target;
  if (!node || !scrollRef?.current) return;

  const scrollToInput = () => {
    try {
      const reactTag = findNodeHandle(node as any);
      const scrollTag = findNodeHandle(scrollRef.current);
      if (reactTag && scrollTag) {
        UIManager.measureLayout(
          reactTag,
          scrollTag,
          () => {},
          (_x, y, _width, height) => {
            UIManager.measure(
              scrollTag,
              (_sx, _sy, _sWidth, sHeight) => {
                const screenH = Dimensions.get('window').height;
                const kbHeight = globalActiveKeyboardHeight > 0 
                  ? globalActiveKeyboardHeight 
                  : (Platform.OS === 'ios' ? 300 : 280);
                const totalContainerH = sHeight > 100 ? sHeight : screenH;
                const visibleHeight = sHeight < (screenH - kbHeight + 50)
                  ? sHeight
                  : Math.max(160, totalContainerH - kbHeight);

                // Position input field comfortably just above keyboard with extraScrollMargin clearance
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
  };

  setTimeout(scrollToInput, Platform.OS === 'ios' ? 80 : 150);
};

export const KeyboardAwareScrollView = React.forwardRef<ScrollView, KeyboardAwareScrollViewProps>(
  ({ children, extraScrollHeight = 30, contentContainerStyle, style, ...props }, ref) => {
    const internalRef = useRef<ScrollView>(null);
    const scrollRef = (ref as React.RefObject<ScrollView>) || internalRef;
    const [keyboardHeight, setKeyboardHeight] = useState<number>(globalActiveKeyboardHeight);

    useEffect(() => {
      const showSub = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
        (e) => {
          const height = e?.endCoordinates?.height || 280;
          globalActiveKeyboardHeight = height;
          setKeyboardHeight(height);
        }
      );
      const hideSub = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
        () => {
          globalActiveKeyboardHeight = 0;
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
      ? basePaddingBottom + keyboardHeight + extraScrollHeight 
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
