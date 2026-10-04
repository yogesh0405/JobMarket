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
  resetScrollOnHide?: boolean;
  resetScrollToCoords?: { x?: number; y?: number };
  children: React.ReactNode;
}

let globalActiveKeyboardHeight = 0;
let globalCurrentScrollY = 0;
let globalPreKeyboardScrollY = 0;

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
  extraScrollMargin = 85,
  explicitKbHeight?: number
) => {
  if (!node || !scrollRef?.current) return;

  try {
    const scrollInstance = scrollRef.current as any;
    const reactTag = typeof node === 'number' ? node : findNodeHandle(node);
    if (!reactTag) return;

    // 1. Try React Native's official native scrollResponder helper
    if (typeof scrollInstance?.scrollResponderScrollNativeHandleToKeyboard === 'function') {
      try {
        scrollInstance.scrollResponderScrollNativeHandleToKeyboard(
          reactTag,
          extraScrollMargin,
          true
        );
      } catch (_) {}
    }

    const scrollTag = findNodeHandle(scrollRef.current);
    if (!scrollTag) return;

    const screenH = Dimensions.get('window').height;
    const kbHeight =
      explicitKbHeight ||
      (globalActiveKeyboardHeight > 0
        ? globalActiveKeyboardHeight
        : Platform.OS === 'ios'
        ? 320
        : 300);

    const keyboardTop = screenH - kbHeight;

    // 2. Exact layout measurement within scrollable content
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
            if (delta > 0 || Math.abs(delta) > 8) {
              const targetY = Math.max(0, globalCurrentScrollY + delta);
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
  extraScrollMargin = 85
) => {
  const node = event?.nativeEvent?.target || event?.target || event;
  if (!node || !scrollRef?.current) return;

  // Tell the scroll view to freeze and lock its pre-keyboard position right now
  const scrollInst = scrollRef.current as any;
  if (scrollInst && typeof scrollInst.__savePreKeyboardPosition === 'function') {
    scrollInst.__savePreKeyboardPosition();
  }

  // Save the pre-keyboard scroll position before elevation occurs
  if (globalActiveKeyboardHeight === 0) {
    globalPreKeyboardScrollY = globalCurrentScrollY;
  }

  lastFocusedTarget = {
    node,
    scrollRef,
    extraMargin: extraScrollMargin,
  };

  // Immediate attempt if keyboard is already open
  if (globalActiveKeyboardHeight > 0) {
    setTimeout(() => {
      scrollToFocused(node, scrollRef, extraScrollMargin, globalActiveKeyboardHeight);
    }, 40);
  } else {
    // If keyboard is animating open, schedule multiple attempts
    setTimeout(() => {
      scrollToFocused(node, scrollRef, extraScrollMargin);
    }, 100);
    setTimeout(() => {
      scrollToFocused(node, scrollRef, extraScrollMargin);
    }, 280);
  }
};

export const dismissKeyboardAndRestore = (
  scrollRef?: React.RefObject<ScrollView | null>,
  targetY?: number
) => {
  Keyboard.dismiss();
  if (scrollRef?.current) {
    const customScroll = scrollRef.current as any;
    if (typeof customScroll.__restorePosition === 'function') {
      customScroll.__restorePosition(targetY);
    } else {
      const safeY = Math.max(0, targetY ?? 0);
      scrollRef.current.scrollTo({ y: safeY, animated: true });
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: safeY, animated: true });
      }, 50);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: safeY, animated: true });
      }, 160);
    }
  }
};

export const KeyboardAwareScrollView = React.forwardRef<ScrollView, KeyboardAwareScrollViewProps>(
  (
    {
      children,
      extraScrollHeight = 40,
      resetScrollOnHide = true,
      resetScrollToCoords,
      contentContainerStyle,
      style,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<ScrollView>(null);
    const scrollRef = (ref as React.RefObject<ScrollView>) || internalRef;
    const [keyboardHeight, setKeyboardHeight] = useState<number>(globalActiveKeyboardHeight);
    const preKeyboardScrollY = useRef(0);
    const currentScrollY = useRef(0);
    const isKeyboardVisibleRef = useRef(globalActiveKeyboardHeight > 0);
    const isElevatedForKeyboardRef = useRef(false);

    const restoreOriginalPosition = (forcedY?: number) => {
      if (resetScrollOnHide === false) return;
      const targetY =
        typeof forcedY === 'number'
          ? forcedY
          : typeof resetScrollToCoords?.y === 'number'
          ? resetScrollToCoords.y
          : preKeyboardScrollY.current;

      const safeY = Math.max(0, targetY);

      // Step 1: Immediate scroll command
      scrollRef.current?.scrollTo({
        y: safeY,
        animated: true,
      });

      // Step 2: Intermediate pass as padding shrinks
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: safeY,
          animated: true,
        });
      }, 50);

      // Step 3: Final pass ensuring Android layout pass didn't clip or revert the scroll
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: safeY,
          animated: true,
        });
        isElevatedForKeyboardRef.current = false;
      }, 160);
    };

    // Attach instance methods onto scrollRef.current for immediate programmatic access
    if (scrollRef.current) {
      const inst = scrollRef.current as any;
      inst.__savePreKeyboardPosition = () => {
        if (!isElevatedForKeyboardRef.current) {
          preKeyboardScrollY.current = Math.max(0, currentScrollY.current);
          isElevatedForKeyboardRef.current = true;
        }
      };
      inst.__restorePosition = (forcedY?: number) => {
        restoreOriginalPosition(forcedY);
      };
    }

    useEffect(() => {
      if (scrollRef.current) {
        const inst = scrollRef.current as any;
        inst.__savePreKeyboardPosition = () => {
          if (!isElevatedForKeyboardRef.current) {
            preKeyboardScrollY.current = Math.max(0, currentScrollY.current);
            isElevatedForKeyboardRef.current = true;
          }
        };
        inst.__restorePosition = (forcedY?: number) => {
          restoreOriginalPosition(forcedY);
        };
      }
    });

    useEffect(() => {
      const onKeyboardShow = (e: any) => {
        isKeyboardVisibleRef.current = true;
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
      };

      const onKeyboardHide = () => {
        isKeyboardVisibleRef.current = false;
        globalActiveKeyboardHeight = 0;
        setKeyboardHeight(0);
        lastFocusedTarget = null;
        restoreOriginalPosition();
      };

      const showSub = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
        onKeyboardShow
      );
      const willHideSub = Keyboard.addListener('keyboardWillHide', onKeyboardHide);
      const didHideSub = Keyboard.addListener('keyboardDidHide', onKeyboardHide);

      return () => {
        showSub.remove();
        willHideSub.remove();
        didHideSub.remove();
      };
    }, [resetScrollOnHide, resetScrollToCoords]);

    const flattenedStyle = StyleSheet.flatten(contentContainerStyle) || {};
    const basePaddingBottom =
      typeof (flattenedStyle as any)?.paddingBottom === 'number'
        ? (flattenedStyle as any).paddingBottom
        : 30;

    const dynamicPaddingBottom =
      keyboardHeight > 0
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
            const y = e.nativeEvent.contentOffset.y;
            currentScrollY.current = y;
            globalCurrentScrollY = y;
            if (!isElevatedForKeyboardRef.current && !isKeyboardVisibleRef.current && globalActiveKeyboardHeight === 0) {
              preKeyboardScrollY.current = y;
              globalPreKeyboardScrollY = y;
            }
            props.onScroll?.(e);
          }}
          onScrollBeginDrag={(e) => {
            if (!isKeyboardVisibleRef.current && globalActiveKeyboardHeight === 0) {
              isElevatedForKeyboardRef.current = false;
            }
            props.onScrollBeginDrag?.(e);
          }}
          contentContainerStyle={[
            styles.scrollContent,
            contentContainerStyle,
            { paddingBottom: dynamicPaddingBottom },
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
