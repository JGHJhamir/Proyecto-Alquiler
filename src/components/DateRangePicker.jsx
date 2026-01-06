import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange, rentalType, blockedDates = [] }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const isDateBlocked = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return blockedDates.includes(dateStr);
    };

    const isDateInPast = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const handleDateClick = (day) => {
        const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateStr = selectedDate.toISOString().split('T')[0];

        if (isDateInPast(selectedDate) || isDateBlocked(selectedDate)) return;

        if (!startDate || (startDate && endDate)) {
            // Iniciar nueva selección
            onStartDateChange(dateStr);
            onEndDateChange('');
        } else if (startDate && !endDate) {
            // Completar el rango
            if (selectedDate > new Date(startDate)) {
                onEndDateChange(dateStr);
            } else {
                onStartDateChange(dateStr);
                onEndDateChange('');
            }
        }
    };

    const isDateSelected = (day) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateStr = date.toISOString().split('T')[0];
        return dateStr === startDate || dateStr === endDate;
    };

    const isDateInRange = (day) => {
        if (!startDate || !endDate) return false;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return date > start && date < end;
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
            {/* Encabezado */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={previousMonth}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <h3 className="text-lg font-bold text-slate-900">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
            </div>

            {/* Nombres de los Días */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map((day) => (
                    <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase">
                        {day}
                    </div>
                ))}
            </div>

            {/* Cuadrícula del Calendario */}
            <div className="grid grid-cols-7 gap-2">
                {/* Celdas vacías para los días antes de que comience el mes */}
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square"></div>
                ))}

                {/* Días del mes */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const isBlocked = isDateBlocked(date);
                    const isPast = isDateInPast(date);
                    const isSelected = isDateSelected(day);
                    const inRange = isDateInRange(day);
                    const isDisabled = isPast || isBlocked;

                    return (
                        <button
                            key={day}
                            onClick={() => handleDateClick(day)}
                            disabled={isDisabled}
                            className={`aspect-square rounded-lg text-sm font-medium transition-all ${isSelected
                                ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 scale-105'
                                : inRange
                                    ? 'bg-brand-blue/10 text-brand-blue'
                                    : isDisabled
                                        ? 'text-slate-300 cursor-not-allowed'
                                        : 'text-slate-700 hover:bg-slate-100'
                                }`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            {/* Leyenda */}
            <div className="mt-6 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-brand-blue"></div>
                    <span className="text-slate-600">Seleccionado</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-brand-blue/10"></div>
                    <span className="text-slate-600">En rango</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-slate-200"></div>
                    <span className="text-slate-600">No disponible</span>
                </div>
            </div>
        </div>
    );
};

export default DateRangePicker;
