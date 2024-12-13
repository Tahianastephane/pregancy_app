import AsyncStorage from '@react-native-async-storage/async-storage';
import * as bcrypt from 'bcryptjs'; // Importation de bcryptjs pour hachage du mot de passe

// Sauvegarder les données sous une clé spécifique
const storeData = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Erreur lors de l\'enregistrement des données', e);
  }
};

// Récupérer les données d'une clé spécifique
const getData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Erreur lors de la lecture des données', e);
    return null;
  }
};

// **Fonctions spécifiques pour la table admin**
export const saveAdmin = async (admin: any) => {
  const admins = await getData('admins');
  const updatedAdmins = admins ? [...admins, admin] : [admin];
  await storeData('admins', updatedAdmins);
};

// Récupérer l'administrateur
export const getAdmin = async () => {
  return await getData('admins');
};

// Fonction pour insérer un admin par défaut si nécessaire
export const initializeAdmin = async () => {
  // Supprimer toutes les données liées aux administrateurs
  await clearAdminData(); // Fonction que vous devrez implémenter pour supprimer les données de l'administrateur

  const newPassword = 'Admin123'; // Le nouveau mot de passe à réinitialiser
  const newUsername = 'Admin'; // Nouveau nom d'utilisateur
  
  // Créer un nouvel administrateur avec les nouvelles informations
  const hashedPassword = bcrypt.hashSync(newPassword, 5); // Hacher le mot de passe pour plus de sécurité
  
  const defaultAdmin = {
    username: newUsername,  // Utilisation du nouveau nom d'utilisateur
    password: hashedPassword,
  };
  
  await saveAdmin(defaultAdmin); // Sauvegarder le nouvel administrateur
  console.log('Administrateur réinitialisé avec succès');
};

// Fonction pour supprimer toutes les données des administrateurs
const clearAdminData = async () => {
  // Effacer les données existantes de l'administrateur
  await storeData('admins', []); // Cela efface la liste des administrateurs dans le stockage
  console.log('Toutes les données des administrateurs ont été supprimées');
};

// **Modèle de Patient**
interface Patient {
  telephone: string; // Utiliser le numéro de téléphone comme identifiant
  nom: string;
  prenom: string;
  age: number;
  marie: 'oui' | 'non';
  region: string;
  district_sanitaire: string;
  formation_sanitaire: string;
  niveau_instruction: string;
  profession_femme: string;
  profession_mari: string;
  adresse: string;
  commune: string;
  date_dernier_accouchement: string;
  nombre_enfants_vivants: number;
  gestite: number;
  parite: number;
  ddr: string;
  dpa: string;
  cpn1: number;
  rappel: string;
}

// **Fonctions spécifiques pour la table patients**
export const savePatient = async (patient: Patient) => {
  const patients = await getData('patients');
  const updatedPatients = patients ? { ...patients, [patient.telephone]: patient } : { [patient.telephone]: patient };
  await storeData('patients', updatedPatients);
};

// Récupérer tous les patients
export const getPatients = async () => {
  return await getData('patients');
};

// **Fonctions spécifiques pour la table antecedents**
export const saveAntecedent = async (antecedent: {
  id?: number; // L'ID est optionnel
  id_patient: string; // L'ID du patient (numéro de téléphone)
  age_inferieur_18_ans: number;
  age_superieur_38_ans: number;
  primipare_agee_plus_35_ans: number;
  parite_superieure_5: number;
  dernier_accouchement_moins_2_ans: number;
  bassin_retreci_asymetrique: number;
  ta_sup_14_8: number;
  diabete: number;
  dyspnee: number;
  intervention: number;
  grossesse_gemellaire: number;
  antecedent: number;
  mort_ne: number;
  fausses_couches: number;
  habitude: number;
}) => {
  const antecedents = await getData('antecedents');
  const updatedAntecedents = antecedents ? [...antecedents, antecedent] : [antecedent];
  await storeData('antecedents', updatedAntecedents);
};

// Récupérer tous les antécédents
export const getAntecedents = async () => {
  return await getData('antecedents');
};

// **Fonctions spécifiques pour la table messages**
export const saveMessage = async (message: {
  id?: number; // L'ID est optionnel
  id_patient: string; // L'ID du patient auquel ce message appartient (numéro de téléphone)
  envoyer: string;
  message: string;
  date_envoie: string;
}) => {
  const messages = await getData('messages');
  const updatedMessages = messages ? [...messages, message] : [message];
  await storeData('messages', updatedMessages);
};

// Récupérer tous les messages
export const getMessages = async () => {
  return await getData('messages');
};

// Initialiser l'administrateur par défaut
initializeAdmin();
