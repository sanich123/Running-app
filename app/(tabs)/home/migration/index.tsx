import { Button, Text } from 'react-native-paper';
import { View } from 'react-native';
import { Link } from 'expo-router';
import { getDocumentAsync } from 'expo-document-picker';
import { cacheDirectory, readAsStringAsync } from 'expo-file-system';
import { showCrossPlatformToast } from '@U/custom-toast';
import { unzip } from 'react-native-zip-archive';
import { parseGPX, parseGPXWithCustomParser } from '@we-gold/gpxjs';
import { DOMParser } from 'xmldom-qsa';
const customParseMethod = (txt: string): Document | null => {
  return new DOMParser().parseFromString(txt, 'text/xml');
};
async function readCacheDirectory() {
  // const gpx = new GpxParser();
  // const gpxFile = await readAsStringAsync(`${cacheDirectory}/stravaMigration/activities/4033303911.gpx`);
  // const gzippedGpx = await readAsStringAsync(`${cacheDirectory}/stravaMigration/activities/4866938425.gpx.gz`);
  // const parsedGpxFile = gpx.parse(gpxFile);
  // gpx.parse(gpxFile);
  // console.log(gpxFile, gpx);
}

// async function isFileAsync(uri) {
//   const result = await getInfoAsync(uri);
//   return result.exists && !result.isDirectory;
// }
export default function Migration() {
  return (
    <View style={{ flex: 1, padding: 10, alignItems: 'center' }}>
      <Text variant="bodyLarge">Вы можете перенести все свои активности из Strava в наш сервис. </Text>
      <View style={{ flex: 1, justifyContent: 'flex-start' }}>
        <Link href="https://support.strava.com/hc/en-us/articles/216918437-Exporting-your-Data-and-Bulk-Export#h_01GG58HC4F1BGQ9PQZZVANN6WF">
          <Text variant="bodyLarge" style={{ color: 'blue' }}>
            1. Более подробная информация по ссылке
          </Text>
        </Link>
        <Text variant="bodyLarge">2. На почту придет письмо со ссылкой на архив в формате .zip</Text>
        <Text variant="bodyLarge">3. Архив надо загрузить по кнопке ниже</Text>
        <Button
          mode="outlined"
          onPress={async () => {
            try {
              const file = await getDocumentAsync();
              if (!file?.canceled) {
                const uriToUzip = file?.assets[0].uri;
                const path = await unzip(uriToUzip, `${cacheDirectory}/stravaMigration`, 'UTF-8');
                console.log(`unzip completed at ${path}`);
              }
            } catch (error) {
              console.log(error);
              showCrossPlatformToast(JSON.stringify(error));
            }
          }}>
          Выбрать архив
        </Button>
        <Button
          mode="outlined"
          onPress={async () => {
            try {
              console.log(' button pressed');
              // const gpxFile = await readAsStringAsync(`${cacheDirectory}/stravaMigration/activities/4033303911.gpx`);
              fetch(`${cacheDirectory}/stravaMigration/activities/4033303911.gpx`)
                .then((response) => {
                  if (!response.ok) {
                    throw new Error('Failed to fetch the file');
                  }
                  return response.text();
                })
                .then((data) => {
                  const [parsedFile, error] = parseGPXWithCustomParser(data, customParseMethod);

                  // Or use a try catch to verify
                  if (error) throw error;

                  const geojson = parsedFile.toGeoJSON();
                });
            } catch (error) {
              showCrossPlatformToast(JSON.stringify(error));
            }
          }}>
          Получить данные о местоположении из gpx
        </Button>
      </View>
    </View>
  );
}
