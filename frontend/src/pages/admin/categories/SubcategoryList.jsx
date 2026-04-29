import React from 'react';

const SubcategoryList = ({ category, onEdit }) => {
  // Aquí va la lista de subcategorías de la categoría seleccionada
  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h2 className="text-lg font-semibold mb-2">Items de {category?.name}</h2>
      {/* Lista de subcategorías aquí */}
      {/* Cada subcategoría: botón editar */}
    </div>
  );
};

export default SubcategoryList;
