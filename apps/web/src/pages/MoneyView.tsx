import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Plus,
  Receipt,
  Trash2,
  X,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { useAppStore } from '../stores/use-app-store';
import { formatMinorUnits, parseMajorToMinor } from '@lifeos/core';
import type { TransactionType } from '@lifeos/shared-types';

export const MoneyView: React.FC = () => {
  const {
    userProfile,
    financialSummary,
    transactions,
    categories,
    addTransaction,
    deleteTransaction,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense' | 'refund'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Modal Form State
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currency = userProfile?.currency || 'INR';

  const filteredTxs = transactions.filter((t) => {
    if (activeTab === 'all') return true;
    return t.type === activeTab;
  });

  const availableCategories = categories.filter((c) => {
    if (txType === 'income') return c.type === 'income';
    return c.type === 'expense';
  });

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amountStr) return;

    const amountMinor = parseMajorToMinor(amountStr);
    if (amountMinor <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    const selectedCat = categoryId || (availableCategories[0]?.id ?? 'cat-default');

    setIsSubmitting(true);
    try {
      await addTransaction({
        accountId: 'acc-cash',
        categoryId: selectedCat,
        amountMinor,
        type: txType,
        timestamp: new Date().toISOString(),
        userTimezone: userProfile?.timezone || 'Asia/Kolkata',
        description: description.trim(),
        notes: null,
        tags: [],
      });

      setDescription('');
      setAmountStr('');
      setIsAddModalOpen(false);
    } catch (err) {
      alert('Failed to save transaction: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-boundary">
        <div>
          <span className="text-xs font-semibold text-accent-primary uppercase tracking-wider">
            Finance
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            Money Management
          </h1>
          <p className="text-xs text-content-secondary mt-0.5">
            Local-first minor-unit ledger strictly calculated from stored records
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Transaction
        </Button>
      </div>

      {/* Overview Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated">
          <div className="text-xs font-medium text-content-secondary mb-1">
            Available Balance
          </div>
          <div className="text-2xl font-extrabold text-content-primary">
            {formatMinorUnits(financialSummary.availableBalanceMinor, currency)}
          </div>
          <p className="text-[11px] text-content-muted mt-1">
            Income − Expenses + Refunds
          </p>
        </Card>

        <Card variant="secondary">
          <div className="flex items-center gap-1.5 text-xs font-medium text-status-success mb-1">
            <ArrowDownLeft size={14} /> Total Income
          </div>
          <div className="text-2xl font-bold text-status-success">
            {formatMinorUnits(financialSummary.totalIncomeMinor, currency)}
          </div>
          <p className="text-[11px] text-content-muted mt-1">
            Salary & revenue
          </p>
        </Card>

        <Card variant="secondary">
          <div className="flex items-center gap-1.5 text-xs font-medium text-status-warning mb-1">
            <ArrowUpRight size={14} /> Total Expenses
          </div>
          <div className="text-2xl font-bold text-status-warning">
            {formatMinorUnits(financialSummary.totalExpensesMinor, currency)}
          </div>
          <p className="text-[11px] text-content-muted mt-1">
            Direct expenditures
          </p>
        </Card>

        <Card variant="secondary">
          <div className="flex items-center gap-1.5 text-xs font-medium text-accent-primary mb-1">
            <RotateCcw size={14} /> Total Refunds
          </div>
          <div className="text-2xl font-bold text-accent-primary">
            {formatMinorUnits(financialSummary.totalRefundsMinor, currency)}
          </div>
          <p className="text-[11px] text-content-muted mt-1">
            Offset against expenses
          </p>
        </Card>
      </div>

      {/* Transaction List Section */}
      <Card variant="elevated" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-boundary">
          <SectionHeader
            title="Transactions"
            subtitle={`${filteredTxs.length} records`}
            className="mb-0"
          />

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-bg-secondary p-1 rounded-md border border-boundary/60 text-xs">
            {(['all', 'income', 'expense', 'refund'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-accent-primary text-white font-semibold'
                    : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredTxs.length > 0 ? (
          <div className="divide-y divide-boundary">
            {filteredTxs.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between text-xs text-content-primary hover:bg-bg-secondary/40 px-2 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-status-success/15 text-status-success'
                          : tx.type === 'expense'
                          ? 'bg-status-warning/15 text-status-warning'
                          : 'bg-accent-primary/15 text-accent-primary'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowDownLeft size={16} />
                      ) : tx.type === 'expense' ? (
                        <ArrowUpRight size={16} />
                      ) : (
                        <RotateCcw size={16} />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{tx.description}</div>
                      <div className="text-content-muted text-[11px] flex items-center gap-2 mt-0.5">
                        <span>{cat?.name || 'General'}</span>
                        <span>•</span>
                        <span>{new Date(tx.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold ${
                        tx.type === 'income'
                          ? 'text-status-success'
                          : tx.type === 'expense'
                          ? 'text-content-primary'
                          : 'text-accent-primary'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : '+'}
                      {formatMinorUnits(tx.amountMinor, currency)}
                    </span>
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-1 rounded text-content-muted hover:text-status-error transition-colors"
                      title="Delete record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Receipt size={28} />}
            title="No transactions logged"
            description="Your local financial ledger is currently empty. Record your first income, expense, or refund transaction."
            action={
              <Button
                size="sm"
                variant="outline"
                icon={<Plus size={14} />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add First Transaction
              </Button>
            }
          />
        )}
      </Card>

      {/* Add Transaction Modal Dialog */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-bg-elevated border border-boundary rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-boundary">
              <h3 className="text-base font-bold text-content-primary">
                Add New Transaction
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded text-content-muted hover:text-content-primary"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Transaction Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['expense', 'income', 'refund'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTxType(type)}
                      className={`py-2 px-3 rounded-md text-xs font-semibold capitalize border transition-colors ${
                        txType === type
                          ? 'bg-accent-primary text-white border-accent-primary'
                          : 'bg-bg-secondary text-content-secondary border-boundary'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Grocery shopping, Monthly rent"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-bg-secondary border border-boundary text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Amount ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-bg-secondary border border-boundary text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-bg-secondary border border-boundary text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-boundary">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                >
                  Save Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
