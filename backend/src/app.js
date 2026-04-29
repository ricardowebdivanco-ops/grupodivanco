import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import nodemailer from 'nodemailer';
import morgan from 'morgan';
import routes from './routes/index.js';

// Configurar zona horaria
process.env.TZ = 'America/Bogota';
console.log('🇨🇴 [SERVER] Zona horaria configurada:', process.env.TZ);
console.log('✅ [SERVER] CORS configurado para grupodivanco.co y grupodivanco.com');
console.log('🕐 [SERVER] Hora actual Colombia:', new Date().toLocaleString('es-CO', {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
}));

// ✅ CARGAR .env ANTES de importar modelos
dotenv.config();
import './data/models/index.js';

const app = express();

// ✅ MIDDLEWARES EN EL ORDEN CORRECTO
app.use(morgan('dev'));

// ✅ CONFIGURAR CORS PRIMERO
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://divanco-web.vercel.app',
      'https://divancoweb.onrender.com',
      'https://yellow-sea-0d0acfc0f.3.azurestaticapps.net',
      'https://grupodivanco.com',
      'https://www.grupodivanco.com',
      'https://grupodivanco.co',
      'https://www.grupodivanco.co',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000'
    ];
    
    // Permitir cualquier URL de preview de Vercel para el proyecto divanco
    const isVercelPreview = origin.match(/https:\/\/divanco-.*\.vercel\.app$/);
    
    if (allowedOrigins.indexOf(origin) !== -1 || isVercelPreview) {
      callback(null, true);
    } else {
      console.warn('🚫 CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
  credentials: true
}));

// ✅ MIDDLEWARE CONDICIONAL - NO parsear JSON en rutas de upload
app.use((req, res, next) => {
  // Excluir rutas que manejan archivos del parsing JSON
  if (req.path.includes('/media') || req.path.includes('/upload')) {
    console.log('🚫 Saltando JSON parsing para:', req.path);
    return next();
  }
  
  // Para todas las demás rutas, aplicar JSON parsing
  express.json({ limit: '10mb' })(req, res, next);
});

app.use((req, res, next) => {
  // Excluir rutas que manejan archivos del parsing URL-encoded
  if (req.path.includes('/media') || req.path.includes('/upload')) {
    return next();
  }
  
  express.urlencoded({ limit: '10mb', extended: true })(req, res, next);
});

// ✅ Static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads/')));


// NOTE: frontend now hosted separately (Azure Static Web Apps).
// Static serving from backend/dist is disabled to avoid trying to access /app/dist inside the container.
// app.use(express.static(path.join(process.cwd(), 'dist')));

app.get('/', (req, res) => {
  res.send('Backend Divanco Running 🏗️');
});

// Health endpoint used by deployment checks
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend is healthy', 
    version: '1.2.0-fix-images-persistence', // 👈 Esta es la marca que buscaremos
    timestamp: new Date().toISOString() 
  });
});

// Ejemplo de endpoint para enviar email
import { sendMail } from './utils/mailer.js';

app.post('/send-email', async (req, res, next) => {
  try {
    const info = await sendMail({
      to: req.body.to,
      subject: req.body.subject,
      text: req.body.text,
      html: req.body.html,
      from: req.body.from,
    });
    res.json({ success: true, info });
  } catch (error) {
    next(error);
  }
});

// ✅ ENDPOINT DE UPLOAD SIMPLE (para testing)
const testUpload = multer({ 
  dest: path.join(process.cwd(), 'uploads/'),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

app.post('/upload', testUpload.single('file'), (req, res) => {
  console.log('📁 Test upload:', req.file);
  res.json({ success: true, file: req.file });
});

// ✅ RUTAS PRINCIPALES (después de middlewares básicos)

app.use(routes);

// SPA fallback removed: frontend is served by Azure Static Web Apps. Backend only serves API routes and uploads.

// 404 handler (solo si no existe ni como archivo ni como ruta)
app.use('*', (req, res) => {
  res.status(404).json({ error: true, message: 'Route not found' });
});

// Error handler
import errorHandler from './middlewares/errorHandler.js';
app.use(errorHandler);

export default app;