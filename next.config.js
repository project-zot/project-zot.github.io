const prefixEnvVar = process.env.NODE_ENV === 'production' && process.env.PREFIX? `/${process.env.PREFIX}`: null;

let repoNameURIPrefix = '';
if (prefixEnvVar === null || prefixEnvVar === undefined) {
    repoNameURIPrefix = 
        process.env.NODE_ENV === 'production' ? '/site-zot' : '';
} else {
    repoNameURIPrefix = process.env.NODE_ENV === 'production' ? prefixEnvVar : '';
}

module.exports = {
    basePath: '',
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