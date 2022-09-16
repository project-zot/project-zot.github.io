const prefixEnvVar = process.env.NODE_ENV === 'production' && process.env.PREFIX? `/${process.env.PREFIX}`: null;

const repoNameURIPrefix = 
  process.env.NODE_ENV === 'production' ? prefixEnvVar??'/site-zot' : '';

module.exports = {
    basePath: repoNameURIPrefix,
    trailingSlash: true,
    images: {
        loader: "custom",
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        nextImageExportOptimizer: {
            imageFolderPath: "public/images",
            exportFolderPath: "out",
            quality: 75,
        },
    },
    env: {
        storePicturesInWEBP: true,
        generateAndUseBlurImages: false,
    },
};