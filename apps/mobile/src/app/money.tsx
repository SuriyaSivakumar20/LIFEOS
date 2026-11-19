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
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Trash2,
  X,
  Wallet,
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
import {
  formatMinorUnits,
  parseMajorToMinor,
  formatShortDate,
} from '@lifeos/core';
import type { TransactionType } from '@lifeos/shared-types';
import { useAppStore } from '../stores/use-app-store';
import { AppHeader } from '../components/app-header';

export default function MoneyScreen() {
  const { colors, spacing, typography, radii } = useTheme();
  const {
    financialSummary,
    transactions,
    categories,
    categoryBreakdown,
    addTransaction,
    deleteTransaction,
    userProfile,
  } = useAppStore();

  const currency = userProfile?.currency ?? 'INR';

  // Add Transaction Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const openAddModal = () => {
    setDescription('');
    setAmountStr('');
    setErrorMsg('');
    setTxType('expense');
    const expenseCats = categories.filter((c) => c.type === 'expense');
    setSelectedCategoryId(expenseCats[0]?.id || categories[0]?.id || '');
    setModalVisible(true);
  };

  const handleSaveTransaction = async () => {
    if (!description.trim()) {
      setErrorMsg('Please enter a description');
      return;
    }
    const minor = parseMajorToMinor(amountStr);
    if (minor === 0) {
      setErrorMsg('Please enter a valid non-zero amount');
      return;
    }

    try {
      // Minor amount stored as positive integer; type determines cash flow
      const absMinor = Math.abs(minor);

      await addTransaction({
        accountId: 'acc-checking',
        categoryId: selectedCategoryId || categories[0]?.id || 'cat-exp-other',
        amountMinor: absMinor,
        type: txType,
        timestamp: new Date().toISOString(),
        userTimezone: userProfile?.timezone || 'Asia/Kolkata',
        description: description.trim(),
        notes: null,
        tags: [],
      });
      setModalVisible(false);
    } catch {
      setErrorMsg('Failed to save transaction');
    }
  };

  const availableCategories =
    txType === 'income'
      ? categories.filter((c) => c.type === 'income')
      : categories.filter((c) => c.type === 'expense');

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="Money"
          subtitle="Financial balances and records"
          rightElement={
            <Button
              title="+ Add"
              onPress={openAddModal}
              size="sm"
            />
          }
        />
      }
    >
      <View style={{ gap: spacing.lg, paddingVertical: spacing.md }}>
        {/* Total Available Balance Card */}
        <Card variant="elevated">
          <Text
            style={[
              styles.cardLabel,
              { color: colors.textSecondary, fontSize: typography.fontSize.small },
            ]}
          >
            Available Balance
          </Text>
          <Text
            style={[
              styles.balanceText,
              {
                color: colors.textPrimary,
                fontSize: typography.fontSize.display,
                fontWeight: typography.fontWeight.bold,
                marginVertical: spacing.xs,
              },
            ]}
          >
            {formatMinorUnits(financialSummary.availableBalanceMinor, currency)}
          </Text>

          <View
            style={[
              styles.metricsRow,
              {
                borderTopColor: colors.border,
                borderTopWidth: 1,
                paddingTop: spacing.md,
                marginTop: spacing.sm,
              },
            ]}
          >
            <View style={styles.metricItem}>
              <View style={styles.metricTitleRow}>
                <TrendingUp size={14} color={colors.success} />
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  Total Income
                </Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.success }]}>
                {formatMinorUnits(financialSummary.totalIncomeMinor, currency)}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <View style={styles.metricTitleRow}>
                <TrendingDown size={14} color={colors.error} />
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  Total Expenses
                </Text>
              </View>
              <Text style={[styles.metricValue, { color: colors.error }]}>
                {formatMinorUnits(financialSummary.totalExpensesMinor, currency)}
              </Text>
            </View>

            {financialSummary.totalRefundsMinor > 0 && (
              <View style={styles.metricItem}>
                <View style={styles.metricTitleRow}>
                  <RotateCcw size={14} color={colors.accentPrimary} />
                  <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                    Refunds
                  </Text>
                </View>
                <Text style={[styles.metricValue, { color: colors.accentPrimary }]}>
                  {formatMinorUnits(financialSummary.totalRefundsMinor, currency)}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Category Overview */}
        <View>
          <SectionHeader
            title="Category Overview"
            subtitle="Expense distribution calculated from stored records"
          />
          {categoryBreakdown.length === 0 ? (
            <EmptyState
              icon={<Wallet size={24} color={colors.accentPrimary} />}
              title="No expense data yet"
              description="Add expenses to see category breakdowns and percentages."
            />
          ) : (
            <Card style={{ gap: spacing.md }}>
              {categoryBreakdown.map((item) => (
                <View key={item.categoryId}>
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryNameRow}>
                      <View
                        style={[
                          styles.categoryDot,
                          { backgroundColor: item.categoryColor },
                        ]}
                      />
                      <Text
                        style={[
                          styles.categoryName,
                          { color: colors.textPrimary, fontSize: typography.fontSize.body },
                        ]}
                      >
                        {item.categoryName}
                      </Text>
                    </View>
                    <View style={styles.categoryAmountRow}>
                      <Text
                        style={[
                          styles.categoryAmount,
                          { color: colors.textPrimary, fontSize: typography.fontSize.body },
                        ]}
                      >
                        {formatMinorUnits(item.totalMinor, currency)}
                      </Text>
                      <Text
                        style={[
                          styles.categoryPercent,
                          { color: colors.textSecondary, fontSize: typography.fontSize.tiny },
                        ]}
                      >
                        ({item.percentage}%)
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View
                    style={[
                      styles.progressBarTrack,
                      { backgroundColor: colors.backgroundElevated, borderRadius: radii.full },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          backgroundColor: item.categoryColor,
                          width: `${Math.min(Math.max(item.percentage, 2), 100)}%`,
                          borderRadius: radii.full,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </Card>
          )}
        </View>

        {/* Recent Transactions List */}
        <View>
          <SectionHeader
            title="Recent Transactions"
            subtitle={`${transactions.length} record${transactions.length === 1 ? '' : 's'}`}
            rightElement={
              <Button
                title="+ Add"
                size="sm"
                variant="secondary"
                onPress={openAddModal}
              />
            }
          />
          {transactions.length === 0 ? (
            <EmptyState
              icon={<Wallet size={24} color={colors.accentPrimary} />}
              title="No transactions yet"
              description="Tap '+ Add' to record your first income, expense, or refund."
              actionLabel="Add Transaction"
              onActionPress={openAddModal}
            />
          ) : (
            <View style={{ gap: spacing.sm }}>
              {transactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const isRefund = tx.type === 'refund';
                const isExpense = tx.type === 'expense';

                return (
                  <Card
                    key={tx.id}
                    padding="sm"
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
                      <View
                        style={[
                          styles.txIconContainer,
                          {
                            backgroundColor: isIncome
                              ? colors.successMuted
                              : isRefund
                              ? colors.accentMuted
                              : colors.errorMuted,
                            borderRadius: radii.md,
                          },
                        ]}
                      >
                        {isIncome ? (
                          <TrendingUp size={16} color={colors.success} />
                        ) : isRefund ? (
                          <RotateCcw size={16} color={colors.accentPrimary} />
                        ) : (
                          <TrendingDown size={16} color={colors.error} />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text
                            style={[
                              styles.txDescription,
                              { color: colors.textPrimary, fontSize: typography.fontSize.body },
                            ]}
                            numberOfLines={1}
                          >
                            {tx.description}
                          </Text>
                          {isRefund && (
                            <View
                              style={[
                                styles.refundBadge,
                                { backgroundColor: colors.accentMuted, borderColor: colors.accentPrimary },
                              ]}
                            >
                              <Text style={[styles.refundBadgeText, { color: colors.accentPrimary }]}>
                                Refund
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.txDate,
                            { color: colors.textSecondary, fontSize: typography.fontSize.tiny },
                          ]}
                        >
                          {formatShortDate(tx.timestamp)}
                        </Text>
                      </View>
                    </View>

                    <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: spacing.sm }}>
                      <Text
                        style={[
                          styles.txAmount,
                          {
                            color: isIncome || isRefund ? colors.success : colors.textPrimary,
                            fontSize: typography.fontSize.body,
                            fontWeight: typography.fontWeight.semibold,
                          },
                        ]}
                      >
                        {isIncome || isRefund ? '+' : '-'}
                        {formatMinorUnits(tx.amountMinor, currency)}
                      </Text>
                      <IconButton
                        icon={<Trash2 size={14} color={colors.textMuted} />}
                        onPress={() => deleteTransaction(tx.id)}
                        size="sm"
                        accessibilityLabel="Delete transaction"
                      />
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      </View>

      {/* Add Transaction Modal */}
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
                Add Transaction
              </Text>
              <IconButton
                icon={<X size={18} color={colors.textSecondary} />}
                onPress={() => setModalVisible(false)}
                accessibilityLabel="Close"
                size="sm"
              />
            </View>

            {/* Type Selector: Expense vs Income vs Refund */}
            <View style={[styles.typeSelector, { backgroundColor: colors.backgroundElevated, borderRadius: radii.md }]}>
              <Pressable
                onPress={() => {
                  setTxType('expense');
                  const expenseCats = categories.filter((c) => c.type === 'expense');
                  setSelectedCategoryId(expenseCats[0]?.id || '');
                }}
                style={[
                  styles.typeTab,
                  {
                    backgroundColor: txType === 'expense' ? colors.error : 'transparent',
                    borderRadius: radii.md - 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.typeTabText,
                    {
                      color: txType === 'expense' ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: typography.fontWeight.semibold,
                    },
                  ]}
                >
                  Expense
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setTxType('income');
                  const incomeCats = categories.filter((c) => c.type === 'income');
                  setSelectedCategoryId(incomeCats[0]?.id || '');
                }}
                style={[
                  styles.typeTab,
                  {
                    backgroundColor: txType === 'income' ? colors.success : 'transparent',
                    borderRadius: radii.md - 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.typeTabText,
                    {
                      color: txType === 'income' ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: typography.fontWeight.semibold,
                    },
                  ]}
                >
                  Income
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setTxType('refund');
                  const expenseCats = categories.filter((c) => c.type === 'expense');
                  setSelectedCategoryId(expenseCats[0]?.id || '');
                }}
                style={[
                  styles.typeTab,
                  {
                    backgroundColor: txType === 'refund' ? colors.accentPrimary : 'transparent',
                    borderRadius: radii.md - 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.typeTabText,
                    {
                      color: txType === 'refund' ? '#FFFFFF' : colors.textSecondary,
                      fontWeight: typography.fontWeight.semibold,
                    },
                  ]}
                >
                  Refund
                </Text>
              </Pressable>
            </View>

            <Input
              label="Description"
              placeholder={
                txType === 'refund'
                  ? 'e.g. Returned shoes, Store refund'
                  : txType === 'income'
                  ? 'e.g. Salary, Client payment'
                  : 'e.g. Groceries, Electricity bill'
              }
              value={description}
              onChangeText={setDescription}
            />

            <Input
              label={`Amount (${currency})`}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={amountStr}
              onChangeText={setAmountStr}
            />

            {/* Category Selector */}
            <View>
              <Text
                style={[
                  styles.categorySelectorLabel,
                  { color: colors.textSecondary, fontSize: typography.fontSize.small, marginBottom: spacing.xs },
                ]}
              >
                {txType === 'refund' ? 'Original Category Refunded' : 'Category'}
              </Text>
              <View style={styles.categoriesRow}>
                {availableCategories.map((c) => {
                  const isSelected = selectedCategoryId === c.id;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setSelectedCategoryId(c.id)}
                      style={[
                        styles.categoryChip,
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
                          styles.categoryChipText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.textPrimary,
                            fontSize: typography.fontSize.tiny,
                            fontWeight: isSelected ? '700' : '400',
                          },
                        ]}
                      >
                        {c.name}
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
                title="Save"
                variant="primary"
                onPress={handleSaveTransaction}
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
  cardLabel: {},
  balanceText: {},
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
  },
  metricTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    fontWeight: '500',
  },
  categoryAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryAmount: {
    fontWeight: '600',
  },
  categoryPercent: {},
  progressBarTrack: {
    height: 6,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  txIconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txDescription: {
    fontWeight: '500',
  },
  txDate: {},
  txAmount: {},
  refundBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  refundBadgeText: {
    fontSize: 10,
    fontWeight: '700',
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
  typeSelector: {
    flexDirection: 'row',
    padding: 3,
  },
  typeTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  typeTabText: {},
  categorySelectorLabel: {},
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryChip: {
    borderWidth: 1,
  },
  categoryChipText: {},
  errorText: {},
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
