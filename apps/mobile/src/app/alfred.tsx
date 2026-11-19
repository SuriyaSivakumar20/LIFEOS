import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import {
  Bot,
  Send,
  MicOff,
  Sparkles,
  Info,
  User,
} from 'lucide-react-native';
import {
  ScreenContainer,
  Card,
  Input,
  IconButton,
  Button,
  useTheme,
} from '@lifeos/ui';
import { ALFRED_DEFAULT_SUGGESTIONS } from '@lifeos/alfred';
import { formatShortDate } from '@lifeos/core';
import { useAppStore } from '../stores/use-app-store';
import { AppHeader } from '../components/app-header';

export default function AlfredScreen() {
  const { colors, spacing, typography, radii } = useTheme();
  const { chatMessages, sendChatMessage } = useAppStore();

  const [inputText, setInputText] = useState('');
  const [showMicNotice, setShowMicNotice] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const msg = inputText.trim();
    setInputText('');
    await sendChatMessage(msg);
  };

  const handleSelectSuggestion = (prompt: string) => {
    setInputText(prompt);
  };

  return (
    <ScreenContainer
      scrollable={false}
      header={
        <AppHeader
          title="Alfred"
          subtitle="Your personal offline assistant"
          showSecondaryActions={true}
        />
      }
    >
      <View style={styles.container}>
        {/* Sprint notice banner */}
        <View
          style={[
            styles.sprintNotice,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
              borderRadius: radii.md,
              padding: spacing.sm,
            },
          ]}
        >
          <Info size={16} color={colors.accentPrimary} />
          <Text
            style={[
              styles.sprintNoticeText,
              { color: colors.textSecondary, fontSize: typography.fontSize.tiny },
            ]}
          >
            Alfred operates locally. AI inference orchestration is scheduled for subsequent sprints.
          </Text>
        </View>

        {/* Chat Messages or Empty Welcome State */}
        <ScrollView
          style={styles.messageList}
          contentContainerStyle={[
            styles.messageContent,
            { paddingVertical: spacing.md },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {chatMessages.length === 0 ? (
            <View style={styles.emptyWelcomeContainer}>
              <View
                style={[
                  styles.welcomeIconWrapper,
                  {
                    backgroundColor: colors.accentMuted,
                    borderColor: colors.accentPrimary,
                    borderRadius: radii.full,
                  },
                ]}
              >
                <Bot size={36} color={colors.accentPrimary} />
              </View>

              <Text
                style={[
                  styles.welcomeTitle,
                  {
                    color: colors.textPrimary,
                    fontSize: typography.fontSize.title2,
                    fontWeight: typography.fontWeight.bold,
                    marginTop: spacing.md,
                  },
                ]}
              >
                Welcome to Alfred
              </Text>
              <Text
                style={[
                  styles.welcomeDesc,
                  {
                    color: colors.textSecondary,
                    fontSize: typography.fontSize.body,
                    textAlign: 'center',
                    marginTop: spacing.xs,
                    maxWidth: 320,
                  },
                ]}
              >
                Your privacy-first companion for managing money, tasks, routines, and life reflections.
              </Text>

              {/* Suggested Prompts */}
              <View style={[styles.suggestionsBlock, { marginTop: spacing.xl }]}>
                <Text
                  style={[
                    styles.suggestionsHeader,
                    {
                      color: colors.textSecondary,
                      fontSize: typography.fontSize.small,
                      fontWeight: typography.fontWeight.semibold,
                      marginBottom: spacing.sm,
                    },
                  ]}
                >
                  Suggested Prompts
                </Text>
                <View style={{ gap: spacing.sm, width: '100%' }}>
                  {ALFRED_DEFAULT_SUGGESTIONS.map((sug) => (
                    <Pressable
                      key={sug.id}
                      onPress={() => handleSelectSuggestion(sug.prompt)}
                      style={({ pressed }) => [
                        styles.suggestionCard,
                        {
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: colors.border,
                          borderRadius: radii.md,
                          padding: spacing.md,
                          opacity: pressed ? 0.75 : 1,
                        },
                      ]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                        <Sparkles size={16} color={colors.accentPrimary} />
                        <Text
                          style={[
                            styles.suggestionText,
                            {
                              color: colors.textPrimary,
                              fontSize: typography.fontSize.small,
                              fontWeight: typography.fontWeight.medium,
                            },
                          ]}
                        >
                          {sug.label}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <View style={{ gap: spacing.md }}>
              {chatMessages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageBubbleWrapper,
                      { alignItems: isUser ? 'flex-end' : 'flex-start' },
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        {
                          backgroundColor: isUser
                            ? colors.accentPrimary
                            : colors.backgroundSecondary,
                          borderColor: isUser ? colors.accentPrimary : colors.border,
                          borderRadius: radii.lg,
                          padding: spacing.md,
                          maxWidth: '82%',
                        },
                      ]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        {isUser ? (
                          <User size={12} color="#FFFFFF" />
                        ) : (
                          <Bot size={12} color={colors.accentPrimary} />
                        )}
                        <Text
                          style={{
                            color: isUser ? 'rgba(255, 255, 255, 0.85)' : colors.textMuted,
                            fontSize: 10,
                            fontWeight: '600',
                          }}
                        >
                          {isUser ? 'You' : 'Alfred'} • {formatShortDate(msg.createdAt)}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.messageText,
                          {
                            color: isUser ? '#FFFFFF' : colors.textPrimary,
                            fontSize: typography.fontSize.body,
                            lineHeight: typography.lineHeight.body,
                          },
                        ]}
                      >
                        {msg.content}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Disabled Mic Notice */}
        {showMicNotice && (
          <View
            style={[
              styles.micNoticeBanner,
              {
                backgroundColor: colors.backgroundElevated,
                borderColor: colors.border,
                borderRadius: radii.sm,
                padding: spacing.xs + 2,
              },
            ]}
          >
            <Text style={{ color: colors.warning, fontSize: typography.fontSize.tiny, textAlign: 'center' }}>
              Microphone voice input is a placeholder and will be enabled in a future sprint.
            </Text>
          </View>
        )}

        {/* Input Bar */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.backgroundSecondary,
              borderTopColor: colors.border,
              padding: spacing.md,
              borderTopWidth: 1,
            },
          ]}
        >
          {/* Disabled Microphone Button Placeholder */}
          <IconButton
            icon={<MicOff size={18} color={colors.textMuted} />}
            onPress={() => setShowMicNotice((prev) => !prev)}
            accessibilityLabel="Microphone input (Coming soon)"
            variant="ghost"
            size="md"
          />

          <View style={{ flex: 1 }}>
            <Input
              placeholder="Ask Alfred or record an insight..."
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              containerStyle={{ marginBottom: 0 }}
            />
          </View>

          <IconButton
            icon={<Send size={18} color="#FFFFFF" />}
            onPress={handleSend}
            disabled={!inputText.trim()}
            variant="accent"
            size="md"
            accessibilityLabel="Send message"
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
  sprintNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    marginHorizontal: 12,
    marginTop: 8,
  },
  sprintNoticeText: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    paddingHorizontal: 12,
    flexGrow: 1,
  },
  emptyWelcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  welcomeIconWrapper: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  welcomeTitle: {},
  welcomeDesc: {},
  suggestionsBlock: {
    width: '100%',
    maxWidth: 480,
  },
  suggestionsHeader: {},
  suggestionCard: {
    borderWidth: 1,
  },
  suggestionText: {},
  messageBubbleWrapper: {
    width: '100%',
  },
  messageBubble: {
    borderWidth: 1,
  },
  messageText: {},
  micNoticeBanner: {
    borderWidth: 1,
    marginHorizontal: 12,
    marginBottom: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
