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
  CheckSquare,
  Square,
  Trash2,
  X,
  Calendar,
  AlertCircle,
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
import { formatLocalDateString, formatShortDate } from '@lifeos/core';
import type { TaskPriority } from '@lifeos/shared-types';
import { useAppStore } from '../stores/use-app-store';
import { AppHeader } from '../components/app-header';

export default function PlannerScreen() {
  const { colors, spacing, typography, radii } = useTheme();
  const { tasks, addTask, toggleTaskStatus, deleteTask } = useAppStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [errorMsg, setErrorMsg] = useState('');

  const todayStr = formatLocalDateString(new Date());

  const todayTasks = tasks.filter((t) => {
    if (t.dueDate) return t.dueDate.startsWith(todayStr);
    return t.createdAt.startsWith(todayStr) || t.status === 'pending';
  });

  const upcomingTasks = tasks.filter((t) => {
    if (t.dueDate && !t.dueDate.startsWith(todayStr) && t.status === 'pending') return true;
    return false;
  });

  const openAddModal = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setErrorMsg('');
    setModalVisible(true);
  };

  const handleSaveTask = async () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a task title');
      return;
    }

    try {
      await addTask({
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        priority,
        status: 'pending',
        dueDate: new Date().toISOString(),
        completedAt: null,
      });
      setModalVisible(false);
    } catch {
      setErrorMsg('Failed to save task');
    }
  };

  const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Planner"
          subtitle="Tasks, schedule and daily priorities"
          rightElement={
            <Button
              title="+ Add Task"
              onPress={openAddModal}
              size="sm"
            />
          }
        />
      }
    >
      <View style={{ gap: spacing.lg, paddingVertical: spacing.md }}>
        {/* Today's Tasks */}
        <View>
          <SectionHeader
            title="Today's Tasks"
            subtitle={`${todayTasks.filter((t) => t.status === 'completed').length}/${todayTasks.length} completed`}
            rightElement={
              <Button
                title="+ Add"
                size="sm"
                variant="secondary"
                onPress={openAddModal}
              />
            }
          />
          {todayTasks.length === 0 ? (
            <EmptyState
              icon={<CheckSquare size={24} color={colors.accentPrimary} />}
              title="No tasks scheduled for today"
              description="Plan your focus for the day by adding your first task."
              actionLabel="Add Task"
              onActionPress={openAddModal}
            />
          ) : (
            <View style={{ gap: spacing.sm }}>
              {todayTasks.map((task) => {
                const isDone = task.status === 'completed';
                return (
                  <Card
                    key={task.id}
                    padding="sm"
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderColor: isDone ? colors.border : colors.borderLight,
                    }}
                  >
                    <Pressable
                      onPress={() => toggleTaskStatus(task.id)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          {
                            borderColor: isDone ? colors.success : colors.border,
                            backgroundColor: isDone ? colors.successMuted : 'transparent',
                          },
                        ]}
                      >
                        {isDone && <CheckSquare size={14} color={colors.success} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.taskTitle,
                            {
                              color: isDone ? colors.textMuted : colors.textPrimary,
                              textDecorationLine: isDone ? 'line-through' : 'none',
                              fontSize: typography.fontSize.body,
                              fontWeight: typography.fontWeight.medium,
                            },
                          ]}
                        >
                          {task.title}
                        </Text>
                        {task.description ? (
                          <Text
                            style={[
                              styles.taskDesc,
                              { color: colors.textSecondary, fontSize: typography.fontSize.tiny },
                            ]}
                            numberOfLines={1}
                          >
                            {task.description}
                          </Text>
                        ) : null}
                      </View>
                    </Pressable>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                      <View
                        style={[
                          styles.priorityBadge,
                          {
                            backgroundColor:
                              task.priority === 'urgent'
                                ? colors.errorMuted
                                : task.priority === 'high'
                                ? colors.warningMuted
                                : colors.backgroundElevated,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityText,
                            {
                              color:
                                task.priority === 'urgent'
                                  ? colors.error
                                  : task.priority === 'high'
                                  ? colors.warning
                                  : colors.textSecondary,
                            },
                          ]}
                        >
                          {task.priority}
                        </Text>
                      </View>

                      <IconButton
                        icon={<Trash2 size={14} color={colors.textMuted} />}
                        onPress={() => deleteTask(task.id)}
                        size="sm"
                        accessibilityLabel="Delete task"
                      />
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </View>

        {/* Upcoming Tasks */}
        <View>
          <SectionHeader
            title="Upcoming Tasks"
            subtitle={`${upcomingTasks.length} pending`}
          />
          {upcomingTasks.length === 0 ? (
            <Card variant="outlined" padding="md">
              <Text style={{ color: colors.textSecondary, fontSize: typography.fontSize.small, textAlign: 'center' }}>
                No future tasks scheduled. All upcoming items are clear.
              </Text>
            </Card>
          ) : (
            <View style={{ gap: spacing.sm }}>
              {upcomingTasks.map((task) => (
                <Card
                  key={task.id}
                  padding="sm"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.taskTitle,
                        { color: colors.textPrimary, fontSize: typography.fontSize.body },
                      ]}
                    >
                      {task.title}
                    </Text>
                    {task.dueDate ? (
                      <Text style={{ color: colors.textSecondary, fontSize: typography.fontSize.tiny }}>
                        Due: {formatShortDate(task.dueDate)}
                      </Text>
                    ) : null}
                  </View>
                  <IconButton
                    icon={<Trash2 size={14} color={colors.textMuted} />}
                    onPress={() => deleteTask(task.id)}
                    size="sm"
                    accessibilityLabel="Delete task"
                  />
                </Card>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Add Task Modal */}
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
                Add New Task
              </Text>
              <IconButton
                icon={<X size={18} color={colors.textSecondary} />}
                onPress={() => setModalVisible(false)}
                accessibilityLabel="Close"
                size="sm"
              />
            </View>

            <Input
              label="Task Title"
              placeholder="e.g. Prepare monthly budget report"
              value={title}
              onChangeText={setTitle}
            />

            <Input
              label="Description (Optional)"
              placeholder="Add extra context or checklist..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {/* Priority Selector */}
            <View>
              <Text
                style={[
                  styles.priorityLabel,
                  { color: colors.textSecondary, fontSize: typography.fontSize.small, marginBottom: spacing.xs },
                ]}
              >
                Priority
              </Text>
              <View style={styles.priorityRow}>
                {priorities.map((p) => {
                  const isSelected = priority === p;
                  return (
                    <Pressable
                      key={p}
                      onPress={() => setPriority(p)}
                      style={[
                        styles.priorityChip,
                        {
                          backgroundColor: isSelected ? colors.accentPrimary : colors.backgroundElevated,
                          borderColor: isSelected ? colors.accentPrimary : colors.border,
                          borderRadius: radii.sm,
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.xs + 2,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityChipText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.textPrimary,
                            fontSize: typography.fontSize.small,
                            fontWeight: isSelected ? '700' : '500',
                            textTransform: 'capitalize',
                          },
                        ]}
                      >
                        {p}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

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
                title="Save Task"
                variant="primary"
                onPress={handleSaveTask}
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
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTitle: {},
  taskDesc: {
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {},
  priorityLabel: {},
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityChip: {
    borderWidth: 1,
    flex: 1,
    alignItems: 'center',
  },
  priorityChipText: {},
  errorText: {},
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
