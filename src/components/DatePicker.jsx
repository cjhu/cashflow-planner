import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-day-picker/style.css';
import './DatePicker.css';

export function DatePicker({ value, onChange, placeholder = 'Select date' }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (date) => {
    if (date) {
      onChange(date);
      setOpen(false);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="date-picker-trigger" type="button">
          <Calendar size={16} />
          <span>{value ? format(value, 'MMM d, yyyy') : placeholder}</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content className="date-picker-content" sideOffset={5} align="start">
          <DayPicker
            mode="single"
            selected={value}
            onSelect={handleSelect}
            showOutsideDays
            className="day-picker"
            components={{
              Chevron: ({ orientation }) => 
                orientation === 'left' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />
            }}
          />
          <Popover.Arrow className="date-picker-arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

