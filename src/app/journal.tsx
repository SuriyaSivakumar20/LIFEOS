import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import {
  Plus,
  BookOpen,
  Search,
  Trash2,
  X,
  Smile,
  Meh,
  Frown,
} from 'lucide-react-native';
import {
  ScreenContainer,
  Card,
  Button,
  Input,
  IconButton,
  SectionHeader,
  EmptyState,
  useTheme,
} from '@lifeos/ui';
import { formatShortDate } from '@lifeos/core';
import type { JournalMood } from '@lifeos/shared-types';
import { useAppStore } from '../stores/use-app-store';
import { AppHeader } from '../components/app-header';

export default function JournalScreen() {
  const { colors, spacing, typography, radii } = useTheme();
  const { journalEntries, addJournalEntry, deleteJournalEntry } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalMood>('good');
  const [errorMsg, setErrorMsg] = useState('');

  const filteredEntries = journalEntries.filter((entry) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      entry.title.toLowerCase().includes(q) ||
      entry.content.toLowerCase().includes(q) ||
      (entry.tags && entry.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  const openAddModal = () => {
    setTitle('');
    setContent('');
    setMood('good');
    setErrorMsg('');
    setModalVisible(true);
  };

  const handleSaveEntry = async () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a title');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('Please write your thoughts in the content field');
      return;
    }

    try {
      await addJournalEntry({
        title: title.trim(),
        content: content.trim(),
        mood,
        tags: [],
      });
      setModalVisible(false);
    } catch {
      setErrorMsg('Failed to save journal entry');
    }
  };

  const moods: { key: JournalMood; label: string }[] = [
    { key: 'great', label: 'Great' },
    { key: 'good', label: 'Good' },
    { key: 'neutral', label: 'Neutral' },
    { key: 'bad', label: 'Tough' },
  ];

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Journal"
          subtitle="Reflections, ideas and daily logs"
          rightElement={
            <Button
              title="+ New Entry"
              onPress={openAddModal}
              size="sm"
            />
          }
        />
      }
    >
      <View style={{ gap: spacing.lg, paddingVertical: spacing.md }}>
        {/* Search Input */}
        <Input
          placeholder="Search journal entries..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={16} color={colors.textSecondary} />}
          rightIcon={
            searchQuery ? (
              <IconButton
                icon={<X size={14} color={colors.textSecondary} />}
                onPress={() => setSearchQuery('')}
                accessibilityLabel="Clear search"
                size="sm"
              />
            ) : undefined
          }
        />

        {/* Entries List */}
        <View>
          <SectionHeader
            title="Reflections"
            subtitle={`${filteredEntries.length} ${filteredEntries.length === 1 ? 'entry' : 'entries'}`}
          />
          {filteredEntries.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={24} color={colors.accentPrimary} />}
              title={searchQuery ? 'No matching entries found' : 'Your journal is empty'}
              description={
                searchQuery
                  ? 'Try searching with a different keyword or clear the search query.'
                  : 'Start by writing down your thoughts, wins, or reflections today.'
              }
              actionLabel={searchQuery ? undefined : 'Write First Entry'}
              onActionPress={searchQuery ? undefined : openAddModal}
            />
          ) : (
            <View style={{ gap: spacing.md }}>
              {filteredEntries.map((entry) => (
                <Card key={entry.id} padding="md">
                  <View style={styles.entryHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.entryTitle,
                          {
                            color: colors.textPrimary,
                            fontSize: typography.fontSize.subhead,
                            fontWeight: typography.fontWeight.semibold,
                          },
                        ]}
                      >
                        {entry.title}
                      </Text>
                      <Text
                        style={[
                          styles.entryDate,
                          { color: colors.textMuted, fontSize: typography.fontSize.tiny, marginTop: 2 },
                        ]}
                      >
                        {formatShortDate(entry.createdAt)}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                      {entry.mood && (
                        <View
                          style={[
                            styles.moodBadge,
                            {
                              backgroundColor: colors.backgroundElevated,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Text style={[styles.moodText, { color: colors.accentPrimary }]}>
                            {entry.mood}
                          </Text>
                        </View>
                      )}
                      <IconButton
                        icon={<Trash2 size={14} color={colors.textMuted} />}
                        onPress={() => deleteJournalEntry(entry.id)}
                        size="sm"
                        accessibilityLabel="Delete entry"
                      />
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.entryContent,
                      {
                        color: colors.textSecondary,
                        fontSize: typography.fontSize.body,
                        lineHeight: typography.lineHeight.body,
                        marginTop: spacing.sm,
                      },
                    ]}
                  >
                    {entry.content}
                  </Text>
                </Card>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Add Entry Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
                borderRadius: radii.xl,
                padding: spacing.xl,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: colors.textPrimary,
                    fontSize: typography.fontSize.title3,
                    fontWeight: typography.fontWeight.semibold,
                  },
                ]}
              >
                New Journal Entry
              </Text>
              <IconButton
                icon={<X size={18} color={colors.textSecondary} />}
                onPress={() => setModalVisible(false)}
                accessibilityLabel="Close"
                size="sm"
              />
            </View>

            <Input
              label="Title"
              placeholder="e.g. Weekly retrospective, Morning thoughts"
              value={title}
              onChangeText={setTitle}
            />

            {/* Mood selector */}
            <View>
              <Text
                style={[
                  styles.moodLabel,
                  { color: colors.textSecondary, fontSize: typography.fontSize.small, marginBottom: spacing.xs },
                ]}
              >
                Mood
              </Text>
              <View style={styles.moodRow}>
                {moods.map((m) => {
                  const isSelected = mood === m.key;
                  return (
                    <Pressable
                      key={m.key}
                      onPress={() => setMood(m.key)}
                      style={[
                        styles.moodChip,
                        {
                          backgroundColor: isSelected ? colors.accentPrimary : colors.backgroundElevated,
                          borderColor: isSelected ? colors.accentPrimary : colors.border,
                          borderRadius: radii.sm,
                          paddingHorizontal: spacing.sm,
                          paddingVertical: spacing.xs,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.moodChipText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.textPrimary,
                            fontSize: typography.fontSize.small,
                            fontWeight: isSelected ? '700' : '400',
                          },
                        ]}
                      >
                        {m.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Input
              label="Content"
              placeholder="What happened today? What are you grateful for?"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={6}
            />

            {errorMsg ? (
              <Text style={[styles.errorText, { color: colors.error, fontSize: typography.fontSize.small }]}>
                {errorMsg}
              </Text>
            ) : null}

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Save Entry"
                variant="primary"
                onPress={handleSaveEntry}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  entryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryTitle: {},
  entryDate: {},
  moodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  moodText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  entryContent: {},
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    borderWidth: 1,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {},
  moodLabel: {},
  moodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  moodChip: {
    borderWidth: 1,
    flex: 1,
    alignItems: 'center',
  },
  moodChipText: {},
  errorText: {},
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
