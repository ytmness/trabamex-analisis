import React from 'react';
import { Search, Filter } from 'lucide-react';

const SuppliesRequestFilters = ({ 
  filters, 
  setFilters, 
  statusOptions, 
  supplyTypeOptions,
  onClearFilters 
}) => {
  return (
    <div className="bg-white rounded-lg p-6 border border-red-200 shadow-sm mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          <Filter className="h-5 w-5 mr-2 text-red-600"/>
          Filtros de Búsqueda
        </h2>
        <p className="text-red-600">Filtrar solicitudes por diferentes criterios</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha Desde */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Fecha Hasta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Búsqueda de Usuario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por email o nombre"
              value={filters.userSearch}
              onChange={(e) => setFilters({...filters, userSearch: e.target.value})}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tipo de Insumo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Insumo</label>
          <select
            value={filters.supplyType}
            onChange={(e) => setFilters({...filters, supplyType: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {supplyTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botón para limpiar filtros */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={onClearFilters}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
};

export default SuppliesRequestFilters;
