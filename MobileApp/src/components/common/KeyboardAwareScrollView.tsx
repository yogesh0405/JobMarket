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
} from 'react-native';

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  extraScrollHeight?: number;
  children: React.ReactNode;
}

export const handleFocusInput = (
  event: NativeSyntheticEvent<TargetedEvent> | any,
  scrollRef: React.RefObject<ScrollView | null>,
  extraScrollHeight = 140
) => {
  const node = event?.nativeEvent?.target || event?.target;
  if (node && scrollRef?.current) {
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
        // Fallback
      }
    }, Platform.OS === 'ios' ? 80 : 120);
  }
};

export const KeyboardAwareScrollView = React.forwardRef<ScrollView, KeyboardAwareScrollViewProps>(
  ({ children, extraScrollHeight = 120, contentContainerStyle, ...props }, ref) => {
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

    const dynamicPaddingBottom = keyboardHeight > 0 ? keyboardHeight + extraScrollHeight : 30;

    return (
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          ref={scrollRef}
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
  scrollContent: {
    flexGrow: 1,
  },
});
