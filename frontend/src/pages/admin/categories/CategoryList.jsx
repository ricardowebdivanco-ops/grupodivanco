import React from 'react';
import { useGetCategoriesQuery } from '../../../features/categories/categoriesApi';

const CategoryList = ({ onSelect, onCreate, onEdit }) => {
  const { data, isLoading, isError, error } = useGetCategoriesQuery({ limit: 50, active: true });

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Categorías</h2>
  <button className="text-naranjaDivanco" onClick={onCreate}>Crear nueva</button>
      </div>
      {isLoading && <div className="text-gray-500">Cargando...</div>}
      {isError && <div className="text-red-600">{error?.data?.message || 'Error al cargar categorías'}</div>}
      <ul className="divide-y divide-gray-100">
        {data?.data?.length === 0 && <li className="py-2 text-gray-400">No hay categorías</li>}
        {data?.data?.map((cat) => (
          <li key={cat.id} className="flex items-center justify-between py-2 group hover:bg-gray-50 rounded px-2">
            <div className="flex-1 cursor-pointer" onClick={() => onSelect(cat)}>
              <span className="font-medium text-gray-800">{cat.name}</span>
              {cat.isShowInHome && <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Home</span>}
            </div>
            <div className="flex gap-2">
              <button
                className="text-xs text-blue-600 hover:underline"
                onClick={() => onEdit(cat)}
              >
                Editar
              </button>
              <button
                className="text-xs text-gray-500 hover:text-gray-800"
                onClick={() => onSelect(cat)}
              >
                Ver Items
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryList;
