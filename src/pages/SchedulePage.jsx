import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  parseISO,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const events = [
  { date: '2025-08-08', type: 'recoleccion' },
  { date: '2025-08-12', type: 'suministro' },
  { date: '2025-08-22', type: 'recoleccion' },
];

const SchedulePage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date('2025-08-01'));

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getEventForDay = (day) => events.find(event => isSameDay(parseISO(event.date), day));

  return (
    <>
      <Helmet>
        <title>Cronograma - MIR</title>
        <meta name="description" content="Visualiza tu cronograma de recolecciones y entregas de suministros." />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-md border"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="text-gray-600" />
              <h1 className="text-2xl font-bold text-gray-800 capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-500 mb-2">
            {dayNames.map(day => <div key={day}>{day}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map(day => {
              const event = getEventForDay(day);
              return (
                <div
                  key={day.toString()}
                  className={cn(
                    'p-2 h-20 flex items-center justify-center rounded-lg transition-colors',
                    !isSameMonth(day, currentMonth) && 'text-gray-300',
                    isToday(day) && 'bg-blue-100 text-blue-600 font-bold',
                    event?.type === 'recoleccion' && 'bg-red-600 text-white font-bold',
                    event?.type === 'suministro' && 'bg-gray-100 text-gray-800 font-bold',
                  )}
                >
                  <span>{format(day, 'd')}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end items-center gap-6 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span>Recolección RPBI</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Entrega de suministros</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 bg-white p-6 rounded-xl shadow-md border"
        >
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Clock className="text-gray-600" />
            Próximos eventos
          </h2>
          <div className="text-center py-12 text-gray-500">
            <p>No hay eventos programados para este período.</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-white p-6 rounded-xl shadow-md border text-center">
                <p className="text-4xl font-bold text-red-600">2</p>
                <p className="text-sm text-gray-500 mt-1">Recolecciones este mes</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-white p-6 rounded-xl shadow-md border text-center">
                <p className="text-4xl font-bold text-green-600">1</p>
                <p className="text-sm text-gray-500 mt-1">Entregas programadas</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.6 }} className="bg-white p-6 rounded-xl shadow-md border text-center">
                <p className="text-4xl font-bold text-gray-800">0</p>
                <p className="text-sm text-gray-500 mt-1">Eventos próximos</p>
            </motion.div>
        </div>
      </div>
    </>
  );
};

export default SchedulePage;
