import AsyncStorage from '@react-native-async-storage/async-storage';
import * as bcrypt from 'bcryptjs'; // Importation de bcryptjs pour hachage du mot de passe
import { storeData, getData } from '../utils/storageUtils'; // Importer les fonctions de votre utilitaire

// **Fonctions spécifiques pour la table admin**
export const saveAdmin = async (admin: any): Promise<void> => {
  const admins = await getData('admins');
  const updatedAdmins = admins ? [...admins, admin] : [admin];
  await storeData('admins', updatedAdmins);
};

// Récupérer l'administrateur
export const getAdmin = async (): Promise<any> => {
  return await getData('admins');
};

// Fonction pour insérer un admin par défaut si nécessaire
export const initializeAdmin = async (): Promise<void> => {
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
const clearAdminData = async (): Promise<void> => {
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
  region: 
    | 'Antananarivo'
    | 'Antsiranana'
    | 'Fianarantsoa'
    | 'Mahajanga'
    | 'Toamasina'
    | 'Toliara'
    | 'Vakinankaratra'
    | 'Amoron\'i Mania'
    | 'Analamanga'
    | 'Atsinanana'
    | 'Haute Matsiatra'
    | 'Ihorombe'
    | 'Itasy'
    | 'Melaky'
    | 'Sava'
    | 'Sofia'
    | 'Atsimo-Andrefana'
    | 'Androy'
    | 'Anosy'
    | 'Bongolava'
    | 'Boeny'
    | 'Menabe'
    | 'Analanjirofo'; // champ region
  district_sanitaire: string;
  formation_sanitaire: string;
  niveau_instruction: string;
  profession_femme: string;
  profession_mari: string;
  adresse: string;
  commune: string;
  date_dernier_accouchement: string;
  nombre_enfants_vivants: string;
  gestite: number;
  parite: number;
  ddr: string;
  dpa: string;
  cpn1: number;
  rappel: string;
}

// **Fonctions spécifiques pour la table patients**
export const savePatient = async (patient: Patient): Promise<void> => {
  const patients = await getData('patients');
  const updatedPatients = patients ? { ...patients, [patient.telephone]: patient } : { [patient.telephone]: patient };
  await storeData('patients', updatedPatients);
};

// Récupérer tous les patients
export const getPatients = async (): Promise<any> => {
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
}): Promise<void> => {
  const antecedents = await getData('antecedents');
  const updatedAntecedents = antecedents ? [...antecedents, antecedent] : [antecedent];
  await storeData('antecedents', updatedAntecedents);
};

// Récupérer tous les antécédents
export const getAntecedents = async (): Promise<any> => {
  return await getData('antecedents');
};

// **Fonctions spécifiques pour la table messages**
export const saveMessage = async (message: {
  id?: number; // L'ID est optionnel
  id_patient: string; // L'ID du patient auquel ce message appartient (numéro de téléphone)
  envoyer: string;
  message: string;
  date_envoie: string;
}): Promise<void> => {
  const messages = await getData('messages');
  const updatedMessages = messages ? [...messages, message] : [message];
  await storeData('messages', updatedMessages);
};

// Récupérer tous les messages
export const getMessages = async (): Promise<any> => {
  return await getData('messages');
};



// **Modèle pour les Rendez-vous**
interface RendezVous {
  id_patient: string; // L'ID du patient, en l'occurrence son numéro de téléphone
  date: string; // La date du rendez-vous
  isCompleted: boolean | null; // Rendez-vous effectué (null signifie que ce n'est ni fait ni non fait)
  notes: string; // Notes pour chaque rendez-vous
}

// **Fonctions spécifiques pour la gestion des rendez-vous**
export const saveRendezVous = async (rendezVous: RendezVous): Promise<void> => {
  const rendezvousList = await getRendezVous(); // Récupérer la liste des rendez-vous existants
  const updatedRendezvousList = rendezvousList ? [...rendezvousList, rendezVous] : [rendezVous];
  await storeData('rendezvous', updatedRendezvousList); // Sauvegarder les nouveaux rendez-vous
};

// Récupérer tous les rendez-vous associés à un patient
export const getRendezVous = async (): Promise<RendezVous[]> => {
  const rendezvous = await getData('rendezvous');
  return rendezvous || []; // Si aucun rendez-vous n'est trouvé, retourner un tableau vide
};

// Récupérer les rendez-vous d'un patient spécifique
export const getRendezVousByPatient = async (id_patient: string): Promise<RendezVous[]> => {
  const rendezvousList = await getRendezVous();
  return rendezvousList.filter(rdv => rdv.id_patient === id_patient);
};

// Mettre à jour un rendez-vous spécifique
export const updateRendezVous = async (rendezVous: RendezVous): Promise<void> => {
  const rendezvousList = await getRendezVous();
  const updatedRendezvousList = rendezvousList.map(rdv =>
    rdv.id_patient === rendezVous.id_patient && rdv.date === rendezVous.date ? rendezVous : rdv
  );
  await storeData('rendezvous', updatedRendezvousList); // Sauvegarder les changements
};

// Exemple de fonction pour enregistrer un patient avec ses rendez-vous
export const savePatientWithRendezVous = async (patient: any, rendezVous: RendezVous[]): Promise<void> => {
  const patients = await getData('patients');
  const updatedPatients = patients ? { ...patients, [patient.telephone]: { ...patient, rendezVous } } : { [patient.telephone]: { ...patient, rendezVous } };
  await storeData('patients', updatedPatients); // Sauvegarder le patient avec ses rendez-vous
};



// Initialiser l'administrateur par défaut
initializeAdmin();