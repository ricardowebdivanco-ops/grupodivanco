import { SiteSetting } from '../data/models/index.js';
import { uploadImageMiddleware, uploadResponsiveImage } from '../config/cloudinary.js';
import { promises as fs } from 'fs';

const HERO_IMAGE_KEY = 'hero_image_url';

// GET /settings/hero-image — público
export const getHeroImage = async (req, res) => {
  try {
    const setting = await SiteSetting.findOne({ where: { key: HERO_IMAGE_KEY } });
    res.json({
      success: true,
      data: { url: setting?.value || null },
    });
  } catch (error) {
    console.error('Error obteniendo hero image:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// PUT /settings/hero-image — solo admin
export const updateHeroImage = [
  uploadImageMiddleware.single('image'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Se requiere una imagen' });
    }

    try {
      const result = await uploadResponsiveImage(req.file.path, 'site-settings/hero');

      // uploadResponsiveImage ya elimina el temp, pero por si acaso:
      await fs.unlink(req.file.path).catch(() => {});

      const imageUrl = result.desktop.url;

      await SiteSetting.upsert({ key: HERO_IMAGE_KEY, value: imageUrl });

      res.json({ success: true, data: { url: imageUrl } });
    } catch (error) {
      await fs.unlink(req.file?.path).catch(() => {});
      console.error('Error subiendo hero image:', error);
      res.status(500).json({ success: false, message: 'Error al subir la imagen' });
    }
  },
];
