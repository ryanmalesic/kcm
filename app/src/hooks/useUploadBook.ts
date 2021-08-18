import { API } from 'aws-amplify';
import React from 'react';

import consts from '../consts';

const useUploadBook = () => {
  const upload = React.useCallback(async (file: File) => {
    if (!file) {
      return;
    }

    const data = await API.get(consts.apiName, '/presigned', {
      queryStringParameters: {
        fileName: file.name,
      },
    });

    await fetch(data.url, {
      method: 'PUT',
      body: file,
    });
  }, []);

  return [upload];
};

export default useUploadBook;
