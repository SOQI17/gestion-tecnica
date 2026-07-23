/**
 * Utilidad oficial para subir y limpiar archivos (PDFs e Imágenes) en Cloudinary
 * Cloud Name: eztjzc2k
 * Upload Preset (Unsigned): preset_mto_archivos
 */

export const getCleanCloudinaryUrl = (rawUrl: string): string => {
  if (!rawUrl) return '';
  let url = rawUrl.trim();

  // Undo any invalid /raw/upload/ conversion if it was uploaded as an image asset
  if (url.includes('/raw/upload/') && url.toLowerCase().endsWith('.pdf')) {
    url = url.replace('/raw/upload/', '/image/upload/');
  }

  // Insert fl_attachment flag into /image/upload/ URLs for PDFs to bypass Cloudinary PDF security restriction
  if (url.includes('/image/upload/') && !url.includes('/fl_attachment/')) {
    return url.replace('/image/upload/', '/image/upload/fl_attachment/');
  }

  return url;
};

export const uploadFileToCloudinary = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> => {
  const CLOUD_NAME = 'eztjzc2k';
  const UPLOAD_PRESET = 'preset_mto_archivos';

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

    xhr.open('POST', url);

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          const finalUrl = response.secure_url || response.url;
          resolve(getCleanCloudinaryUrl(finalUrl));
        } catch (err) {
          reject(new Error('Error al procesar la respuesta de Cloudinary'));
        }
      } else {
        try {
          const errorResp = JSON.parse(xhr.responseText);
          reject(new Error(errorResp.error?.message || 'Error al subir el archivo a Cloudinary'));
        } catch {
          reject(new Error(`Error de servidor Cloudinary (${xhr.status})`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Error de red al conectar con Cloudinary'));
    };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    xhr.send(formData);
  });
};
