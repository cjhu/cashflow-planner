import { format } from 'date-fns';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { AlertTriangle, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import './Timeline.css';

export function Timeline({ data, transfers }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateStr) => {
    return format(new Date(dateStr + 'T00:00:00'), 'MMM d');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'income':
        return <TrendingUp size={14} />;
      case 'expense':
        return <TrendingDown size={14} />;
      default:
        return <Wallet size={14} />;
    }
  };

  return (
    <div className="timeline-card">
      {transfers.length > 0 && (
        <div className="transfer-alert">
          <h3>
            <AlertTriangle size={18} />
            Recommended Savings Transfers
          </h3>
          <p>Transfer these amounts before the listed dates to avoid negative balance:</p>
          <div className="transfer-list">
            {transfers.map((t, i) => (
              <div key={i} className="transfer-item">
                <div className="transfer-info">
                  <span className="transfer-date">By {formatDate(t.date)}</span>
                  <span className="transfer-reason">Before: {t.beforeEvent}</span>
                </div>
                <span className="transfer-amount">{formatCurrency(t.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="timeline-section">
        <h2 className="timeline-title">📊 Cash Flow Timeline</h2>
        
        {data.length <= 1 ? (
          <div className="empty-timeline">
            <span className="empty-icon">📅</span>
            <p>Add income and expenses to see your cash flow timeline</p>
          </div>
        ) : (
          <ScrollArea.Root className="timeline-scroll">
            <ScrollArea.Viewport className="timeline-viewport">
              <div className="timeline-header-row">
                <div>Date</div>
                <div>Description</div>
                <div className="align-right">Change</div>
                <div className="align-right">Balance</div>
              </div>
              
              {data.map((item, index) => (
                <div 
                  key={index} 
                  className={`timeline-item ${item.isNegative ? 'negative' : ''} ${item.balance < 100 && item.balance >= 0 ? 'warning' : ''}`}
                >
                  <div className="timeline-date">{formatDate(item.date)}</div>
                  <div className="timeline-description">
                    <span className={`timeline-type-icon ${item.type}`}>
                      {getTypeIcon(item.type)}
                    </span>
                    <div className="timeline-desc-text">
                      <span>{item.description}</span>
                      {item.type !== 'balance' && (
                        <small>{item.type}</small>
                      )}
                    </div>
                  </div>
                  <div 
                    className="timeline-change"
                    data-positive={item.change > 0}
                    data-negative={item.change < 0}
                  >
                    {item.change !== 0 
                      ? (item.change > 0 ? '+' : '') + formatCurrency(item.change) 
                      : '—'}
                  </div>
                  <div 
                    className="timeline-balance"
                    data-negative={item.balance < 0}
                    data-warning={item.balance >= 0 && item.balance < 100}
                  >
                    {formatCurrency(item.balance)}
                  </div>
                </div>
              ))}
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar className="timeline-scrollbar" orientation="vertical">
              <ScrollArea.Thumb className="timeline-thumb" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>
        )}
      </div>
    </div>
  );
}

