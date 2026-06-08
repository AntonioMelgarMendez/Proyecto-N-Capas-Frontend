import { Calendar, MapPin, Clock } from 'lucide-react';

const ReservationCard = ({ title, date, location, status }) => {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Calendar className="text-primary" size={20} />
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}>
          {status.toUpperCase()}
        </span>
      </div>
      <h3 className="text-lg font-bold text-primary mb-1">{title}</h3>
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <MapPin size={14} />
        <span>{location}</span>
      </div>
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Clock size={14} />
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
};

export default ReservationCard;
