#!/bin/bash

# Script para borrar completamente la base de datos sin crear ningún dato

echo "⚠️  ADVERTENCIA: Este script BORRARÁ TODOS LOS DATOS de la base de datos ⚠️"
echo "⚠️  NO se creará ningún usuario ni datos ⚠️"
echo ""
echo "Presiona CTRL+C para cancelar o ENTER para continuar..."
read

echo "🧨 Borrando completamente la base de datos..."

# Ejecutar el script que borra toda la base de datos
node src/data/resetDatabase.cjs

echo "✅ Proceso completado."
