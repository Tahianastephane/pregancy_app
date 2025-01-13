import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.projet.app',
  appName: 'pregnancy',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000, // Temps d'affichage en millisecondes
      launchAutoHide: true,     // Masquer automatiquement après la durée
      backgroundColor: '#ffffff', // Couleur de fond
      androidSplashResourceName: 'splash', // Nom de l'image pour Android
      showSpinner: false        // Afficher ou non un indicateur de chargement
    }
  }
};

export default config;
