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
let globalCurrentScrollY = 0;

interface FocusedTargetInfo {
  node: any;
  scrollRef: React.RefObject<ScrollView | null>;
  extraMargin: number;
}

let lastFocusedTarget: FocusedTargetInfo | null = null;

Keyboard.addListener(
  Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
  (e) => {
    globalActiveKeyboardHeight = e?.endCoordinates?.height || (Platform.OS === 'ios' ? 320 : 300);
  }
);
Keyboard.addListener(
  Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
  () => {
    globalActiveKeyboardHeight = 0;
    lastFocusedTarget = null;
  }
);

export const scrollToFocused = (
  node: any,
  scrollRef: React.RefObject<ScrollView | null>,
  extraScrollMargin = 60,
  explicitKbHeight?: number
) => {
  if (!node || !scrollRef?.current) return;

  try {
    const reactTag = typeof node === 'number' ? node : findNodeHandle(node);
    const scrollTag = findNodeHandle(scrollRef.current);
    if (!reactTag || !scrollTag) return;

    const screenH = Dimensions.get('window').height;
    const kbHeight =
      explicitKbHeight ||
      (globalActiveKeyboardHeight > 0
        ? globalActiveKeyboardHeight
        : Platform.OS === 'ios'
        ? 320
        : 300);

    const keyboardTop = screenH - kbHeight;

    // Use measureLayout to get the exact Y coordinate within the scrollable content
    UIManager.measureLayout(
      reactTag,
      scrollTag,
      () => {
        // Fallback: If measureLayout fails, use measureInWindow
        UIManager.measureInWindow(reactTag, (_wx, wy, _ww, wheight) => {
          if (typeof wy === 'number' && !isNaN(wy)) {
            const inputBottom = wy + wheight;
            const targetBottom = keyboardTop - extraScrollMargin;
            const delta = inputBottom - targetBottom;
            if (delta > 0) {
              const targetY = Math.max(0, globalCurrentScrollY + delta + 20);
              scrollRef.current?.scrollTo({
                y: targetY,
                animated: true,
              });
            }
          }
        });
      },
      (_x, y, _width, height) => {
        UIManager.measure(scrollTag, (_sx, sy, _sWidth, _sHeight, _pageX, pageY) => {
          const scrollviewTop =
            typeof pageY === 'number' && pageY > 0
              ? pageY
              : typeof sy === 'number' && sy > 0
              ? sy
              : 0;
          // The visible area of the scroll view before the keyboard begins
          const availableViewportHeight = Math.max(
            150,
            keyboardTop - scrollviewTop
          );

          // Position the input with extraScrollMargin space above the keyboard
          const targetY = Math.max(
            0,
            y + height + extraScrollMargin - availableViewportHeight
          );
          scrollRef.current?.scrollTo({ y: targetY, animated: true });
        });
      }
    );
  } catch (e) {
    // Fallback
  }
};

export const handleFocusInput = (
  event: NativeSyntheticEvent<TargetedEvent> | any,
  scrollRef: React.RefObject<ScrollView | null>,
  extraScrollMargin = 60
) => {
  const node = event?.nativeEvent?.target || event?.target || event;
  if (!node || !scrollRef?.current) return;

  lastFocusedTarget = {
    node,
    scrollRef,
    extraMargin: extraScrollMargin,
  };

  // Immediate attempt
  if (globalActiveKeyboardHeight > 0) {
    setTimeout(() => {
      scrollToFocused(node, scrollRef, extraScrollMargin, globalActiveKeyboardHeight);
    }, 40);
  } else {
    // If keyboard is animating open, schedule a scroll attempt
    setTimeout(() => {
      scrollToFocused(node, scrollRef, extraScrollMargin);
    }, 120);
  }
};

export const KeyboardAwareScrollView = React.forwardRef<ScrollView, KeyboardAwareScrollViewProps>(
  ({ children, extraScrollHeight = 40, contentContainerStyle, style, ...props }, ref) => {
    const internalRef = useRef<ScrollView>(null);
    const scrollRef = (ref as React.RefObject<ScrollView>) || internalRef;
    const [keyboardHeight, setKeyboardHeight] = useState<number>(globalActiveKeyboardHeight);

    useEffect(() => {
      const showSub = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
        (e) => {
          const height = e?.endCoordinates?.height || (Platform.OS === 'ios' ? 320 : 300);
          globalActiveKeyboardHeight = height;
          setKeyboardHeight(height);

          // Re-scroll active focused input with the exact measured keyboard height
          if (lastFocusedTarget && lastFocusedTarget.scrollRef === scrollRef) {
            setTimeout(() => {
              if (lastFocusedTarget) {
                scrollToFocused(
                  lastFocusedTarget.node,
                  lastFocusedTarget.scrollRef,
                  lastFocusedTarget.extraMargin,
                  height
                );
              }
            }, Platform.OS === 'ios' ? 60 : 120);
          }
        }
      );
      const hideSub = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
        () => {
          globalActiveKeyboardHeight = 0;
          setKeyboardHeight(0);
          lastFocusedTarget = null;
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
      ? basePaddingBottom + keyboardHeight + extraScrollHeight + 60 
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
          scrollEventThrottle={16}
          onScroll={(e) => {
            globalCurrentScrollY = e.nativeEvent.contentOffset.y;
            props.onScroll?.(e);
          }}
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
