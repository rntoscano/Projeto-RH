const MAX_PHOTO_SIZE_IN_BYTES = 5 * 1024 * 1024;
const MAX_PHOTO_DIMENSION = 640;
const PHOTO_QUALITY = 0.82;
const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const PHOTO_INPUT_ACCEPT = ACCEPTED_PHOTO_TYPES.join(',');

export function isEmbeddedPhoto(value?: string): boolean {
  return Boolean(value?.startsWith('data:image/'));
}

export function getPhotoForApi(value?: string): string | undefined {
  if (!value || isEmbeddedPhoto(value)) {
    return undefined;
  }

  return value;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Não foi possível ler a foto selecionada.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Não foi possível carregar a prévia da foto.'));
    image.src = dataUrl;
  });
}

function resizeImage(dataUrl: string): Promise<string> {
  return loadImage(dataUrl).then((image) => {
    const ratio = Math.min(1, MAX_PHOTO_DIMENSION / image.width, MAX_PHOTO_DIMENSION / image.height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * ratio));
    canvas.height = Math.max(1, Math.round(image.height * ratio));

    const context = canvas.getContext('2d');

    if (!context) {
      return dataUrl;
    }

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', PHOTO_QUALITY);
  });
}

export async function readPhotoFile(file: File): Promise<string> {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
    throw new Error('Escolha uma foto em JPG, PNG ou WebP.');
  }

  if (file.size > MAX_PHOTO_SIZE_IN_BYTES) {
    throw new Error('Escolha uma foto com até 5 MB.');
  }

  const dataUrl = await readFileAsDataUrl(file);
  return resizeImage(dataUrl);
}
