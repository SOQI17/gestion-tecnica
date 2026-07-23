/**
 * Utilidad oficial para subir y limpiar archivos (PDFs e Imágenes) en Cloudinary
 * Cloud Name: eztjzc2k
 * Upload Preset (Unsigned): preset_mto_archivos
 */

export const getCleanCloudinaryUrl = (rawUrl: string): string => {
  if (!rawUrl) return '';
  // Convert /image/upload/ to /raw/upload/ for PDF files to bypass Cloudinary PDF image security restrictions
  if (rawUrl.includes('/image/upload/') && rawUrl.toLowerCase().endsWith('.pdf')) {
    return rawUrl.replace('/image/upload/', '/raw/upload/');
  }
  return rawUrl;
};

export const uploadFileToCloudinary = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> => {
  const CLOUD_NAME = 'eztjzc2k';
  const UPLOAD_PRESET = 'preset_mto_archivos';

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  // For PDFs, use 'raw' resource type so Cloudinary delivers it as an authentic document
  const resourceType = isPdf ? 'raw' : 'auto';

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

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
