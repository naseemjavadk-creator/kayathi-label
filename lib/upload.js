export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_BYTES = 5 * 1024 * 1024;
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

// Returns an error message, or null when the file is acceptable.
export function validateImage(file) {
  if (!ALLOWED_TYPES.includes(file.type)) return `${file.name}: use a JPG, PNG or WebP image.`;
  if (file.size > MAX_BYTES) return `${file.name}: image is larger than 5 MB.`;
  return null;
}

export async function uploadImage(sb, file, folder) {
  const path = `${folder}/${crypto.randomUUID()}.${EXT[file.type]}`;
  const { error } = await sb.storage
    .from('media')
    .upload(path, file, { contentType: file.type, cacheControl: '31536000' });
  if (error) throw error;
  const { data } = sb.storage.from('media').getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function removeFiles(sb, paths) {
  const list = paths.filter(Boolean);
  if (list.length) await sb.storage.from('media').remove(list);
}
