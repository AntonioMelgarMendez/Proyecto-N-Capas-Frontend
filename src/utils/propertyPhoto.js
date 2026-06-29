import { propertyApi } from '../api/propertyApi';

/**
 * Resolves a displayable image URL for a property photo.
 * Prefers the API proxy (stable) over presigned S3 URLs or raw S3 keys.
 */
export const resolvePropertyPhotoSrc = (photo) => {
  if (!photo) return null;
  if (photo.id) {
    return propertyApi.getPhotoImageUrl(photo.id);
  }
  if (photo.s3Url?.startsWith('http')) {
    return photo.s3Url;
  }
  return null;
};

export const pickPrimaryPhoto = (photos = []) =>
  photos.find((p) => p.isPrimary) ?? photos[0] ?? null;
