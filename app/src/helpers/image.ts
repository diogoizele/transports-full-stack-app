import RNFS from 'react-native-fs';
import { Image } from '../../../types/Image';

export async function prepareImagesToSync(images: Image[] = []) {
  return Promise.all(
    images.map(async img => {
      if (!img.path.startsWith('file://')) return img;

      const base64 = await RNFS.readFile(
        img.path.replace('file://', ''),
        'base64',
      );

      return { ...img, path: `data:image/jpeg;base64,${base64}` };
    }),
  );
}
