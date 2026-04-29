#!/bin/bash
# Script para ejecutar seeding solo si es necesario
echo "Checking if database needs seeding..."
node src/data/seedDataStandalone.cjs
echo "Starting application..."
node src/index.js
