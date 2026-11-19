import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '../theme-context';

export interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function ScreenContainer({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
  edges = ['top', 'left', 'right'],
  header,
  footer,
}: ScreenContainerProps) {
  const { colors, spacing } = useTheme();

  const isWeb = Platform.OS === 'web';

  const innerContent = (
    <View
      style={[
        styles.innerContent,
        isWeb && styles.webMaxWidth,
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.safeArea,
        { backgroundColor: colors.backgroundPrimary },
        style,
      ]}
    >
      {header}

      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: spacing.md, paddingBottom: spacing.xxxl * 2 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {innerContent}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.fixedContainer,
            { paddingHorizontal: spacing.md },
          ]}
        >
          {innerContent}
        </View>
      )}

      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    flexGrow: 1,
  },
  fixedContainer: {
    flex: 1,
    alignItems: 'center',
  },
  innerContent: {
    width: '100%',
    flex: 1,
  },
  webMaxWidth: {
    maxWidth: 720,
    alignSelf: 'center',
  },
});
