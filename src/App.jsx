import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { MonthSelector } from './components/MonthSelector';
import { EntryCard } from './components/EntryCard';
import { Timeline } from './components/Timeline';
import './App.css';

function App() {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [startingBalance, setStartingBalance] = useState(0);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Storage key for current month
  const storageKey = `cashflow-${year}-${month}`;

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      setStartingBalance(parsed.startingBalance || 0);
      setIncomes(parsed.incomes || []);
      setExpenses(parsed.expenses || []);
    } else {
      setStartingBalance(0);
      setIncomes([]);
      setExpenses([]);
    }
  }, [storageKey]);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({
      startingBalance,
      incomes,
      expenses,
    }));
  }, [storageKey, startingBalance, incomes, expenses]);

  // Calculate timeline and transfers
  const { timelineData, transfers, stats } = useMemo(() => {
    const events = [];
    const firstOfMonth = new Date(year, month, 1);
    
    // Add starting balance
    events.push({
      date: format(firstOfMonth, 'yyyy-MM-dd'),
      description: 'Starting Balance',
      type: 'balance',
      amount: startingBalance,
    });

    // Add incomes
    incomes.forEach((income) => {
      events.push({
        date: income.date,
        description: income.name,
        type: 'income',
        amount: income.amount,
      });
    });

    // Add expenses
    expenses.forEach((expense) => {
      events.push({
        date: expense.date,
        description: expense.name,
        type: 'expense',
        amount: expense.amount,
      });
    });

    // Sort by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate running balance
    let balance = 0;
    let totalIncome = 0;
    let totalExpenses = 0;
    let minBalance = Infinity;

    const timeline = events.map((event) => {
      let change = 0;

      if (event.type === 'balance') {
        balance = event.amount;
      } else if (event.type === 'income') {
        change = event.amount;
        balance += event.amount;
        totalIncome += event.amount;
      } else if (event.type === 'expense') {
        change = -event.amount;
        balance -= event.amount;
        totalExpenses += event.amount;
      }

      if (balance < minBalance) {
        minBalance = balance;
      }

      return {
        ...event,
        change,
        balance,
        isNegative: balance < 0,
      };
    });

    // Calculate transfers needed (apply suggested transfers to avoid double counting)
    const transfersNeeded = [];
    let runningBalance = startingBalance;
    
    events.forEach((event) => {
      if (event.type === 'income') {
        runningBalance += event.amount;
      } else if (event.type === 'expense') {
        runningBalance -= event.amount;
      }

      if (runningBalance < 0) {
        const existingIdx = transfersNeeded.findIndex(t => t.date === event.date);
        const amount = Math.ceil(Math.abs(runningBalance) / 100) * 100;
        
        if (existingIdx >= 0) {
          if (amount > transfersNeeded[existingIdx].amount) {
            const delta = amount - transfersNeeded[existingIdx].amount;
            transfersNeeded[existingIdx].amount = amount;
            runningBalance += delta;
          }
        } else {
          transfersNeeded.push({
            date: event.date,
            beforeEvent: event.description,
            amount,
          });
          runningBalance += amount;
        }
      }
    });

    const transferNeeded = minBalance < 0 
      ? Math.ceil(Math.abs(minBalance) / 100) * 100 
      : 0;

    return {
      timelineData: timeline,
      transfers: transfersNeeded,
      stats: {
        totalIncome,
        totalExpenses,
        endBalance: balance,
        transferNeeded,
      },
    };
  }, [startingBalance, incomes, expenses, year, month]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const handleAddIncome = (income) => {
    setIncomes([...incomes, income]);
  };

  const handleDeleteIncome = (id) => {
    setIncomes(incomes.filter((i) => i.id !== id));
  };

  const handleAddExpense = (expense) => {
    setExpenses([...expenses, expense]);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const defaultDate = new Date(year, month, 1);

  return (
    <div className="container">
      <header>
        <h1>💰 Cash Flow Planner</h1>
        <p className="subtitle">Plan your checking account & savings transfers</p>
      </header>

      <MonthSelector
        month={month}
        year={year}
        onMonthChange={setMonth}
        onYearChange={setYear}
      />

      <div className="main-grid">
        {/* Balance Card */}
        <div className="balance-card">
          <div className="balance-input-group">
            <label htmlFor="balance">Starting Checking Balance</label>
            <div className="balance-input">
              <span className="currency-symbol">$</span>
              <input
                id="balance"
                type="number"
                value={startingBalance || ''}
                onChange={(e) => setStartingBalance(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          <div className="summary-stats">
            <div className="stat">
              <span className="stat-label">Total Income</span>
              <span className="stat-value positive">{formatCurrency(stats.totalIncome)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Expenses</span>
              <span className="stat-value negative">{formatCurrency(stats.totalExpenses)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">End Balance</span>
              <span className={`stat-value ${stats.endBalance >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(stats.endBalance)}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Transfer Needed</span>
              <span className="stat-value warning">{formatCurrency(stats.transferNeeded)}</span>
            </div>
          </div>
        </div>

        {/* Entry Cards */}
        <EntryCard
          title="Income"
          type="income"
          entries={incomes}
          onAdd={handleAddIncome}
          onDelete={handleDeleteIncome}
          defaultDate={defaultDate}
        />

        <EntryCard
          title="Expenses"
          type="expense"
          entries={expenses}
          onAdd={handleAddExpense}
          onDelete={handleDeleteExpense}
          defaultDate={defaultDate}
        />

        {/* Timeline */}
        <Timeline data={timelineData} transfers={transfers} />
      </div>
    </div>
  );
}

export default App;
