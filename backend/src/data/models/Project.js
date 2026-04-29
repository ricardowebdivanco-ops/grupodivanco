import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize.js";

class Project extends Model {}

Project.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [5, 200],
      },
    },
    description: {
      type: DataTypes.TEXT(1500),
      validate: {
        len: [0, 1500],
      },
    },
    shortDescription: {
      type: DataTypes.TEXT(200),
      validate: {
        len: [0, 200],
      },
    },
    slug: {
      type: DataTypes.STRING(220),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 220],
      },
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2000,
        max: new Date().getFullYear() + 5,
      },
    },
    location: {
      type: DataTypes.STRING(200),
    },
    client: {
      type: DataTypes.STRING(150),
    },
    architect: {
      type: DataTypes.STRING(150),
    },
    // Tipo de participación (puede tener múltiples tipos)
    projectType: {
      type: DataTypes.ARRAY(DataTypes.TEXT), // ✅ Cambiar de ENUM a TEXT para evitar conflictos
      allowNull: false,
      defaultValue: ["Proyecto"],
      validate: {
        notEmpty: true,
        isValidArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('projectType debe ser un array');
          }
          if (value.length === 0) {
            throw new Error('Debe seleccionar al menos un tipo de proyecto');
          }
          const validTypes = ["Diseño", "Proyecto", "Dirección de Obra"];
          const allValid = value.every(type => validTypes.includes(type));
          if (!allValid) {
            throw new Error('Tipos de proyecto inválidos');
          }
        }
      },
    },
    // Estado del proyecto
    etapa: {
      type: DataTypes.ENUM("render", "obra", "finalizado"),
      defaultValue: "render",
    },
    area: {
      type: DataTypes.STRING(50),
    },
    // Contenido del proyecto
    content: {
      type: DataTypes.TEXT(5000),
      validate: {
        len: [0, 5000],
      },
    },

    kuulaUrl: {
      type: DataTypes.STRING(500),
      validate: {
        isUrl: {
          msg: "Debe ser una URL válida",
        },
        len: [0, 500],
      },
    },

    tags: {
      type: DataTypes.ARRAY(
        DataTypes.ENUM([
          "residencial",
          "comercial",
          "industrial",
          "piscinas",
          "restaurantes",
          "hoteles",
          "oficinas",
          "moderno",
          "clasico",
          "minimalista",
          "sustentable",
          "lujo",
          "economico",
          "reforma",
          "construccion_nueva",
        ])
      ),
      defaultValue: [],
    },
    searchableText: {
      type: DataTypes.TEXT,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    showInSlider: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    startDate: {
      type: DataTypes.DATE,
    },
    endDate: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "Project",
    hooks: {
      beforeValidate: (project, options) => {
        console.log("🔍 HOOK beforeValidate ejecutado");
        console.log(
          "   - Project data:",
          JSON.stringify(project.dataValues, null, 2)
        );
      },

      afterValidate: (project, options) => {
        console.log("✅ HOOK afterValidate ejecutado");
        console.log("   - Validación exitosa para:", project.title);
      },

      beforeSave: async (project, options) => {
        console.log("🔍 HOOK beforeSave ejecutado");
        console.log("   - isNewRecord:", project.isNewRecord);
        console.log("   - Project ID:", project.id);
        console.log("   - Title:", project.title);

        try {
          // ✅ Auto-generar slug SOLO si no existe
          if (!project.slug && project.title && project.year) {
            const baseSlug = `${project.title
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g, "")
              .replace(/\s+/g, "-")}-${project.year}`;

            console.log("   - Base slug generado:", baseSlug);

            // ✅ Verificar si el slug ya existe
            let finalSlug = baseSlug;
            let counter = 1;

            while (true) {
              console.log("   - Verificando slug:", finalSlug);

              const existingProject = await Project.findOne({
                where: {
                  slug: finalSlug,
                  id: { [DataTypes.Op.ne]: project.id || 0 },
                },
              });

              if (!existingProject) {
                console.log("   - Slug disponible:", finalSlug);
                break;
              }

              console.log("   - Slug ya existe, probando siguiente...");
              finalSlug = `${baseSlug}-${counter}`;
              counter++;
            }

            project.slug = finalSlug;
            console.log("   - Slug final asignado:", project.slug);
          }

          // ✅ Generar searchableText
          const tagsText = project.tags ? project.tags.join(" ") : "";
          project.searchableText = `${project.title || ""} ${
            project.description || ""
          } ${project.shortDescription || ""} ${project.content || ""} ${project.location || ""} ${
            project.client || ""
          } ${project.architect || ""} ${tagsText} ${
            project.year || ""
          }`.toLowerCase();

          console.log(
            "   - SearchableText generado (primeros 100 chars):",
            project.searchableText.substring(0, 100)
          );
        } catch (hookError) {
          console.error("❌ ERROR en beforeSave hook:", hookError);
          throw hookError;
        }
      },

      afterSave: (project, options) => {
        console.log("✅ HOOK afterSave ejecutado");
        console.log("   - Proyecto guardado con ID:", project.id);
        console.log(
          "   - isNewRecord era:",
          project._previousDataValues ? false : true
        );
      },

      beforeCreate: (project, options) => {
        console.log("🆕 HOOK beforeCreate ejecutado");
        console.log("   - Creando proyecto:", project.title);
      },

      afterCreate: (project, options) => {
        console.log("✅ HOOK afterCreate ejecutado");
        console.log("   - Proyecto creado exitosamente con ID:", project.id);
      },
      beforeDestroy: (project, options) => {
        console.log("🗑️ HOOK beforeDestroy ejecutado");
        console.log("   - Eliminando proyecto ID:", project.id);
        console.log("   - Título:", project.title);
        console.log("   - Stack trace:");
        console.trace();
      },
      afterDestroy: (project, options) => {
        console.log("✅ HOOK afterDestroy ejecutado");
        console.log("   - Proyecto eliminado ID:", project.id);
      },
      beforeBulkDestroy: (options) => {
        console.log("🗑️ HOOK beforeBulkDestroy ejecutado");
        console.log("   - Eliminación masiva con opciones:", options.where);
        console.trace();
      },
      afterBulkDestroy: (options) => {
        console.log("✅ HOOK afterBulkDestroy ejecutado");
        console.log("   - Eliminación masiva completada");
      },
    },
    indexes: [
      {
        fields: ["slug"],
      },
      {
        fields: ["year"],
      },
      {
        fields: ["projectType"],
      },
      {
        fields: ["etapa"],
      },
      {
        fields: ["searchableText"], // Índice simple
      },
      {
        fields: ["isActive"],
      },
      {
        fields: ["isFeatured"],
      },
      {
        fields: ["isPublic"],
      },
    ],
  }
);

Project.prototype.getMainImage = function () {
  return this.media?.find((m) => m.isMain && m.isActive) || this.media?.[0];
};

Project.prototype.getMediaByType = function (type) {
  return (this.media || [])
    .filter((m) => m.type === type && m.isActive)
    .sort((a, b) => a.order - b.order);
};

Project.prototype.getRenders = function () {
  return this.getMediaByType("render");
};

Project.prototype.getPlanos = function () {
  return this.getMediaByType("plano");
};

Project.prototype.getVideos = function () {
  return this.getMediaByType("video");
};

Project.prototype.getObraProceso = function () {
  return this.getMediaByType("obra_proceso");
};

Project.prototype.getObraFinalizada = function () {
  return this.getMediaByType("obra_finalizada");
};

export default Project;
