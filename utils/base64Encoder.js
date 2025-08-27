// utils/base64Encoder.js

import * as FileSystem from 'expo-file-system';

export const encodeToBase64 = async (uri) => {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64;
};
