import React, { useEffect } from 'react';
import { StatusBar, StatusBarProps, Platform } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

export const FocusAwareStatusBar: React.FC<StatusBarProps> = (props) => {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused && Platform.OS === 'android') {
      const bg = (props.backgroundColor as string) || '#FFFFFF';
      const style = props.barStyle || 'dark-content';
      const translucent = typeof props.translucent === 'boolean' ? props.translucent : false;

      StatusBar.setBackgroundColor(bg, true);
      StatusBar.setBarStyle(style, true);
      StatusBar.setTranslucent(translucent);
    }
  }, [isFocused, props.backgroundColor, props.barStyle, props.translucent]);

  if (!isFocused) {
    return null;
  }

  return <StatusBar {...props} />;
};
