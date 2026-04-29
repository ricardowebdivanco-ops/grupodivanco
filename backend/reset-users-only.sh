#!/bin/bash

# Script para limpiar la base de datos y crear usuarios predeterminados

echo "⚠️  ADVERTENCIA: Este script BORRARÁ TODOS LOS DATOS de la base de datos ⚠️"
echo "⚠️  Se recrearán solo los usuarios admin y editor ⚠️"
echo ""
echo "Presiona CTRL+C para cancelar o ENTER para continuar..."
read

echo "🧹 Limpiando base de datos y creando usuarios predeterminados..."

# Ejecutar el script que solo crea usuarios predeterminados
node src/data/seedDataStandalone.new.cjs

echo "✅ Proceso completado."
