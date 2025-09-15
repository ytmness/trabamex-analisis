import React from 'react';
import { 
  FileText,
  Clock,
  CheckCircle,
  Box
} from 'lucide-react';

const SuppliesRequestStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-600 text-sm font-medium">Total Solicitudes</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-full">
            <FileText className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-yellow-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-600 text-sm font-medium">Pendientes</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-full">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-600 text-sm font-medium">Aprobadas Hoy</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.approvedToday}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-600 text-sm font-medium">Total Items</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalItems}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-full">
            <Box className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuppliesRequestStats;
