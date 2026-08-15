import React, { useRef, useEffect } from 'react';
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
} from 'react-native';

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  extraScrollHeight?: number;
  children: React.ReactNode;
}

export const KeyboardAwareScrollView = React.forwardRef<ScrollView, KeyboardAwareScrollViewProps>(
  ({ children, extraScrollHeight = 85, contentContainerStyle, ...props }, ref) => {
    const internalRef = useRef<ScrollView>(null);
    const scrollRef = (ref as React.RefObject<ScrollView>) || internalRef;
    const keyboardHeightRef = useRef<number>(0);

    useEffect(() => {
      const showSub = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
        (e) => {
          keyboardHeightRef.current = e.endCoordinates ? e.endCoordinates.height : 250;
        }
      );
      const hideSub = Keyboard.addListener(
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
        () => {
          keyboardHeightRef.current = 0;
        }
      );

      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }, []);

    const handleFocus = (event: NativeSyntheticEvent<TargetedEvent>) => {
      const node = event.nativeEvent?.target;
      if (node && scrollRef.current) {
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
                  const targetY = Math.max(0, y - extraScrollHeight);
                  scrollRef.current?.scrollTo({ y: targetY, animated: true });
                }
              );
            }
          } catch (e) {
            // Ignore unmount measurement errors
          }
        }, Platform.OS === 'ios' ? 80 : 120);
      }
    };

    return (
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={true}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          onFocus={handleFocus}
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
  scrollContent: {
    flexGrow: 1,
  },
});
