# Script de Carga de Datos de Desarrollo

Este script carga datos de ejemplo para acelerar el desarrollo del sistema.

## ¿Qué carga?

### 📁 **4 Categorías:**
1. **Amoblamientos** - Muebles y elementos de amoblamiento
2. **Accesorios** - Elementos decorativos y funcionales
3. **Materiales** - Materiales de construcción y acabados
4. **Herramientas** - Herramientas y equipos para construcción

### 📂 **12 Subcategorías (3 por categoría):**

**Amoblamientos:**
- Muebles de Sala
- Muebles de Dormitorio  
- Muebles de Comedor

**Accesorios:**
- Iluminación
- Textiles
- Decoración

**Materiales:**
- Revestimientos
- Pisos
- Pinturas

**Herramientas:**
- Herramientas Manuales
- Herramientas Eléctricas
- Equipos de Medición

### 📦 **40 Productos totales (10 por categoría)**

Todos los productos incluyen:
- ✅ Nombres realistas
- ✅ Descripciones detalladas
- ✅ Precios en **COP** (pesos colombianos)
- ✅ Stock variado (de 2 a 200 unidades)
- ✅ Slugs únicos
- ✅ Los primeros 3 productos de cada categoría marcados como destacados

## 🚀 **Cómo usar el script:**

### Ejecutar una vez:
```bash
cd backend
npm run seed
```

### Para desarrollo continuo:
- Solo ejecuta el script cuando inicies un nuevo entorno
- Las imágenes las agregas manualmente después
- El script no elimina datos existentes (por seguridad)

## 📋 **Ejemplo de productos cargados:**

**Amoblamientos:**
- Sofá Modular Esquinero - $2,890,000 COP (5 en stock)
- Mesa de Centro Moderna - $650,000 COP (8 en stock)
- Cama Queen Size - $1,850,000 COP (3 en stock)

**Materiales:**
- Porcelanato Rectificado 60x60 - $45,000 COP (150 en stock)
- Pintura Latex Interior - $89,000 COP (80 en stock)

## ⚠️ **Importante:**
- El script está configurado para **NO eliminar** datos existentes
- Si quieres limpiar la base primero, descomenta las líneas de `destroy` en el código
- Todos los precios están en formato colombiano (COP)
- Los productos aparecen con indicadores de stock (Disponible/Últimas unidades/Agotado)

## 🎯 **Resultado esperado:**
```
🌱 Iniciando carga de datos de desarrollo...
🔗 Conexión a la base de datos establecida
📁 Creando categoría: Amoblamientos
  📂 Creando subcategoría: Muebles de Sala
    📦 Creando producto: Sofá Modular Esquinero
    📦 Creando producto: Mesa de Centro Moderna
    ... (continúa con todos los productos)
✅ Datos de desarrollo cargados exitosamente!
📊 Resumen:
   - 4 categorías
   - 12 subcategorías  
   - 40 productos
```

¡Listo para que agregues las imágenes y tengas un catálogo completo!
