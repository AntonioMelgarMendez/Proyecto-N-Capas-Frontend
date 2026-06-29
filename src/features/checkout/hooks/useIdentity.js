import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { identityApi } from '../../../api/identityApi';

export const useIdentity = (userId) => {
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState(null);

  const identityQuery = useQuery({
    queryKey: ['identity', userId],
    queryFn: () => identityApi.getUser(userId),
    enabled: !!userId,
    retry: false,
  });

  const isVerified = identityQuery.isSuccess && identityQuery.data != null;
  const needsUpload = identityQuery.isSuccess && identityQuery.data == null;

  const uploadMutation = useMutation({
    mutationFn: (payload) => identityApi.upload({ userId, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['identity', userId] });
    },
  });

  useEffect(() => {
    if (!isVerified || !userId) {
      setPreviewUrl(null);
      return undefined;
    }

    let revoked = false;
    let objectUrl = null;

    identityApi.downloadBlob(userId).then((blob) => {
      if (revoked) return;
      objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
    }).catch(() => {
      if (!revoked) setPreviewUrl(null);
    });

    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [isVerified, userId, identityQuery.dataUpdatedAt]);

  return {
    identityQuery,
    isVerified,
    needsUpload,
    uploadMutation,
    previewUrl,
    isLoading: identityQuery.isLoading || uploadMutation.isPending,
  };
};
