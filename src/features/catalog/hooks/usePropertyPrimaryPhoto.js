import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { propertyApi } from '../../../api/propertyApi';
import { pickPrimaryPhoto } from '../../../utils/propertyPhoto';

/**
 * Loads the primary property photo URL via the photos API.
 * Prefers the backend image proxy; falls back to presigned S3 URLs when the proxy fails.
 */
export const usePropertyPrimaryPhoto = (propertyId) => {
  const [failedSrc, setFailedSrc] = useState(null);
  const [usePresignedFallback, setUsePresignedFallback] = useState(false);

  const { data: photos, isLoading } = useQuery({
    queryKey: ['photos', propertyId],
    queryFn: () => propertyApi.getPhotos(propertyId).then((r) => r.data ?? []),
    enabled: !!propertyId,
  });

  const primaryPhoto = pickPrimaryPhoto(photos ?? []);
  const proxyUrl = primaryPhoto?.id ? propertyApi.getPhotoImageUrl(primaryPhoto.id) : null;
  const presignedUrl = primaryPhoto?.s3Url?.startsWith('http') ? primaryPhoto.s3Url : null;

  const preferredUrl = usePresignedFallback
    ? presignedUrl
    : proxyUrl ?? presignedUrl;

  const photoUrl = preferredUrl && preferredUrl !== failedSrc ? preferredUrl : null;

  const onError = () => {
    if (!usePresignedFallback && proxyUrl && presignedUrl && preferredUrl === proxyUrl) {
      setUsePresignedFallback(true);
      return;
    }
    setFailedSrc(preferredUrl);
  };

  return {
    photoUrl,
    isLoading,
    onError,
  };
};
