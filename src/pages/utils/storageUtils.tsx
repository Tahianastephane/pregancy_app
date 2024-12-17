import pako from 'pako';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toByteArray, fromByteArray } from 'base64-js';

// Fonction pour convertir Uint8Array en chaîne base64
const uint8ArrayToBase64 = (uint8Array: Uint8Array): string => {
  return fromByteArray(uint8Array);
};

// Fonction pour convertir une chaîne base64 en Uint8Array
const base64ToUint8Array = (base64: string): Uint8Array => {
  return toByteArray(base64);
};

// Fonction pour compresser les données
export const compressData = (data: any): string => {
  try {
    console.log('Données avant compression:', data);
    const stringifiedData = JSON.stringify(data);
    const compressedData = pako.deflate(stringifiedData);
    const base64Data = uint8ArrayToBase64(compressedData);
    console.log('Données après compression:', base64Data);
    return base64Data;
  } catch (e) {
    console.error('Erreur lors de la compression des données:', e);
    throw new Error('Erreur de compression des données');
  }
};

// Fonction pour décompresser les données
export const decompressData = (compressedData: string): any => {
  try {
    console.log('Données avant décompression:', compressedData);
    const uint8ArrayData = base64ToUint8Array(compressedData);
    const decompressedData = pako.inflate(uint8ArrayData, { to: 'string' });
    const parsedData = JSON.parse(decompressedData);
    console.log('Données après décompression:', parsedData);
    return parsedData;
  } catch (e) {
    console.error('Erreur lors de la décompression des données:', e);
    throw new Error('Erreur de décompression des données');
  }
};

// Fonction pour stocker les données avec compression
export const storeData = async (key: string, value: any): Promise<void> => {
  try {
    const compressedValue = compressData(value);
    await AsyncStorage.setItem(key, compressedValue);
    console.log(`Données stockées sous la clé "${key}":`, compressedValue);
  } catch (e) {
    console.error('Erreur lors de l\'enregistrement des données:', e);
  }
};

// Fonction pour récupérer les données avec décompression
export const getData = async (key: string): Promise<any | null> => {
  try {
    const compressedValue = await AsyncStorage.getItem(key);
    console.log(`Données récupérées sous la clé "${key}":`, compressedValue);
    if (compressedValue !== null) {
      return decompressData(compressedValue);
    }
    return null;
  } catch (e) {
    console.error('Erreur lors de la récupération des données:', e);
    return null;
  }
};
