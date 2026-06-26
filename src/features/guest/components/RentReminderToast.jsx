import { useState } from 'react';
import { Bell, X, CreditCard, CalendarCheck, CalendarX, AlertCircle } from 'lucide-react';

const TYPE_CONFIG = {
  payment:  { icon: CreditCard,    bg: 'bg-amber-50',  border: 'border-amber-200', iconColor: 'text-amber-600',  titleColor: 'text-amber-800' },
  checkin:  { icon: CalendarCheck, bg: 'bg-blue-50',   border: 'border-blue-200',  iconColor: 'text-blue-600',   titleColor: 'text-blue-800'  },
  checkout: { icon: CalendarX,     bg: 'bg-violet-50', border: 'border-violet-200',iconColor: 'text-violet-600', titleColor: 'text-violet-800'},
  active:   { icon: Bell,          bg: 'bg-green-50',  border: 'border-green-200', iconColor: 'text-green-600',  titleColor: 'text-green-800' },
};

/**
 * Renders dismissable reminder toasts derived from useRentReminder.
 * @param {{ reminders: Array<{ type, title, message, reservationId }> }} props
 */
const RentReminderToast = ({ reminders }) => {
  const [dismissed, setDismissed] = useState(new Set());

  const visible = reminders.filter((r) => !dismissed.has(r.reservationId + r.type));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {visible.map((reminder) => {
        const key = reminder.reservationId + reminder.type;
        const cfg = TYPE_CONFIG[reminder.type] ?? TYPE_CONFIG.active;
        const Icon = cfg.icon;

        return (
          <div
            key={key}
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${cfg.bg} ${cfg.border}`}
          >
            <Icon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${cfg.iconColor}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${cfg.titleColor}`}>{reminder.title}</p>
              <p className={`text-xs mt-0.5 ${cfg.iconColor}`}>{reminder.message}</p>
            </div>
            <button
              onClick={() => setDismissed((prev) => new Set([...prev, key]))}
              className={`flex-shrink-0 ${cfg.iconColor} hover:opacity-70 transition-opacity`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default RentReminderToast;
