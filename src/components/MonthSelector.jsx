import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import './MonthSelector.css';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function MonthSelector({ month, year, onMonthChange, onYearChange }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

  return (
    <div className="month-selector">
      <Select.Root value={String(month)} onValueChange={(v) => onMonthChange(Number(v))}>
        <Select.Trigger className="select-trigger" aria-label="Month">
          <Select.Value />
          <Select.Icon className="select-icon">
            <ChevronDown size={16} />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content className="select-content" position="popper" sideOffset={5}>
            <Select.Viewport className="select-viewport">
              {MONTHS.map((name, index) => (
                <Select.Item key={index} value={String(index)} className="select-item">
                  <Select.ItemText>{name}</Select.ItemText>
                  <Select.ItemIndicator className="select-item-indicator">
                    <Check size={14} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      <Select.Root value={String(year)} onValueChange={(v) => onYearChange(Number(v))}>
        <Select.Trigger className="select-trigger" aria-label="Year">
          <Select.Value />
          <Select.Icon className="select-icon">
            <ChevronDown size={16} />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content className="select-content" position="popper" sideOffset={5}>
            <Select.Viewport className="select-viewport">
              {years.map((y) => (
                <Select.Item key={y} value={String(y)} className="select-item">
                  <Select.ItemText>{y}</Select.ItemText>
                  <Select.ItemIndicator className="select-item-indicator">
                    <Check size={14} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

