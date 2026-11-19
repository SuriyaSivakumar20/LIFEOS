import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Plus,
  Filter,
  Receipt,
  Tag,
  Calendar,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { EmptyState } from '../components/ui/EmptyState';

export const MoneyView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense' | 'refund'>('all');

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
          onClick={() => alert('Add Transaction modal will be fully connected to Dexie in Sprint 4.')}
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
            ₹0.00
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
            ₹0.00
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
            ₹0.00
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
            ₹0.00
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
            subtitle="Chronological record history"
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

        {/* Empty State */}
        <EmptyState
          icon={<Receipt size={28} />}
          title="No transactions logged"
          description="Your local financial ledger is currently empty. Record your first income, expense, or refund transaction."
          action={
            <Button
              size="sm"
              variant="outline"
              icon={<Plus size={14} />}
              onClick={() => alert('Add Transaction modal will be fully connected to Dexie in Sprint 4.')}
            >
              Add First Transaction
            </Button>
          }
        />
      </Card>
    </div>
  );
};
