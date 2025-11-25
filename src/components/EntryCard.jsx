import { useState } from 'react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Tooltip from '@radix-ui/react-tooltip';
import { format } from 'date-fns';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { DatePicker } from './DatePicker';
import './EntryCard.css';

export function EntryCard({ title, type, entries, onAdd, onDelete, defaultDate }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(defaultDate);

  const isIncome = type === 'income';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !amount || !date) return;

    onAdd({
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      name,
      amount: parseFloat(amount),
      date: format(date, 'yyyy-MM-dd'),
    });

    setName('');
    setAmount('');
  };

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="entry-card" style={{ animationDelay: isIncome ? '0.2s' : '0.3s' }}>
      <div className="entry-card-header">
        <h2 className="entry-card-title">
          <span className={`entry-icon ${type}`}>
            {isIncome ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          </span>
          {title}
        </h2>
      </div>

      <form className="entry-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Description"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="entry-input"
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
          min="0"
          className="entry-input amount"
          required
        />
        <DatePicker value={date} onChange={setDate} />
        <button type="submit" className={`btn btn-${type}`}>
          Add
        </button>
      </form>

      <ScrollArea.Root className="scroll-area-root">
        <ScrollArea.Viewport className="scroll-area-viewport">
          {sortedEntries.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">{isIncome ? '💵' : '💳'}</span>
              <p>No {type} entries yet</p>
            </div>
          ) : (
            <div className="entries-list">
              {sortedEntries.map((entry) => (
                <div key={entry.id} className="entry-item">
                  <div className="entry-info">
                    <span className="entry-name">{entry.name}</span>
                    <span className="entry-date">
                      {format(new Date(entry.date + 'T00:00:00'), 'MMM d')}
                    </span>
                  </div>
                  <div className="entry-actions">
                    <span className={`entry-amount ${type}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(entry.amount)}
                    </span>
                    <Tooltip.Provider>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button
                            className="btn-delete"
                            onClick={() => onDelete(entry.id)}
                            type="button"
                          >
                            <X size={14} />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content className="tooltip-content" sideOffset={5}>
                            Delete entry
                            <Tooltip.Arrow className="tooltip-arrow" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className="scroll-area-scrollbar" orientation="vertical">
          <ScrollArea.Thumb className="scroll-area-thumb" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
}

