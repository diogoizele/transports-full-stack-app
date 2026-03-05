import RNFS from 'react-native-fs';

export async function prepareImagesToSync(images: string[]) {
  const fileUris = images.filter(uri => uri.startsWith('file://'));

  return Promise.all(
    fileUris.map(async uri => {
      const base64 = await RNFS.readFile(uri, 'base64');
      return `data:image/jpeg;base64,${base64}`;
    }),
  );
}
