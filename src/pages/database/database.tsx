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
  profession :string,
  adresse: string;
  commune: string;
  date_dernier_accouchement: string;
  nombre_enfants_vivants: string;
  ddr: string;
  dpa: string;
  cin: string;
  prestataire : string,
  csb : string,
  Nbcpn : number,
  cpn : string,
  rappel: string;
}



// **Fonctions spécifiques pour la table patients**
export const savePatient = async (patient: Patient): Promise<void> => {
  const patients = await getData('patients'); // Récupération des patients existants

  let updatedPatients: Patient[];

  if (patients) {
    const patientIndex = patients.findIndex((existingPatient: Patient) => existingPatient.telephone === patient.telephone);
    
    if (patientIndex !== -1) {
      // Le patient existe déjà, donc on le met à jour
      updatedPatients = [...patients];
      updatedPatients[patientIndex] = patient;
    } else {
      // Le patient n'existe pas, donc on l'ajoute
      updatedPatients = [...patients, patient];
    }
  } else {
    // Aucun patient dans le stockage, on crée un tableau avec ce patient
    updatedPatients = [patient];
  }

  // Sauvegarde la liste mise à jour dans AsyncStorage
  await storeData('patients', updatedPatients);
};


// Récupérer tous les patients


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

// **Modèle pour les Soignants**
export interface Soignant {
  nom : string,
  prenom : string,
  contact : string,
  matricule: string; // Matricule unique
  cin: string;
  region: 
  | 'Alaotra Mangory'
  | 'Analamanga'
  | 'Androy'
  | 'Anosy'
  | 'Atsimo Andrefana'
  | 'Atsimo antsinana'
  | 'Atsinana'
  | 'Bestiboka'
  | 'boeny'
  | 'Bongolava'
  | 'Diana'
  | 'Fitovinany'
  | 'haute Matsiatra'
  | 'Ihorombe'
  | 'Itasy'
  | 'Melaky'
  | 'Menabe'
  | 'Sava'
  | 'Sofia'
  | 'Vakinankaratra'
  | 'Vatovavy',
 district: string;
  commune: string;
  lastConnection?: {
    connected: boolean; // True si connecté, false sinon
    connectionTime?: string; // Heure de la dernière connexion
    disconnectionTime?: string; // Heure de la déconnexion
  };
}


// **Fonctions spécifiques pour la table Soignants**
// Sauvegarder un soignant
export const saveSoignant = async (soignant: Soignant): Promise<void> => {
  const soignants = await getData('soignants');
  const updatedSoignants = soignants ? { ...soignants, [soignant.matricule]: soignant } : { [soignant.matricule]: soignant };
  await storeData('soignants', updatedSoignants);
};


// Récupérer un soignant par matricule
export const getSoignantByMatricule = async (matricule: string): Promise<Soignant | null> => {
  const soignants = await getData('soignants');

  return soignants ? soignants[matricule] || null : null;
};

// Récupérer tous les soignants
export const getAllSoignants = async (): Promise<Soignant[]> => {
  const soignants = await getData('soignants');
  return soignants ? Object.values(soignants) : [];
};

// Supprimer un soignant par matricule
export const deleteSoignant = async (matricule: string): Promise<void> => {
  const soignants = await getData('soignants');
  if (soignants && soignants[matricule]) {
    delete soignants[matricule];
    await storeData('soignants', soignants);
  }
};
// Ajouter une fonction pour l'historique des patients annulés
interface HistoriqueAnnulation {
  id_patient: string; // L'ID du patient
  nom: string; // Le nom du patient
  prenom: string; // Le prénom du patient
  date_annulation: string; // La date de l'annulation
}

export const saveAnnulationToHistorique = async (patient: Patient): Promise<void> => {
  const historique = await getData('historique_annulations');
  const annulation: HistoriqueAnnulation = {
    id_patient: patient.telephone,
    nom: patient.nom,
    prenom: patient.prenom,
    date_annulation: new Date().toISOString(), // La date actuelle de l'annulation
  };
  const updatedHistorique = historique ? [...historique, annulation] : [annulation];
  await storeData('historique_annulations', updatedHistorique);
};

// Fonction pour annuler un patient et enregistrer l'annulation dans l'historique
// Définir le type d'objet patients
interface Patients {
  [key: string]: Patient; // Les clés sont de type string (téléphone) et les valeurs sont de type Patient
}

export const cancelPatient = async (patient: Patient): Promise<void> => {
  const patients: Patients = await getData('patients'); // Déclarer le type explicitement

  if (!patients || !patients[patient.telephone]) return;

  // Sauvegarder l'annulation dans l'historique
  await saveAnnulationToHistorique(patient);

  // Supprimer le patient de la liste des patients
  const updatedPatients = Object.keys(patients)
    .filter(key => key !== patient.telephone) // Exclure le patient annulé
    .reduce((acc: Patients, key) => {
      acc[key] = patients[key];
      return acc;
    }, {} as Patients); // Cast explicite à 'Patients'

  await storeData('patients', updatedPatients); // Sauvegarder les patients après suppression
};


// Récupérer l'historique des annulations
export const getHistoriqueAnnulations = async (): Promise<HistoriqueAnnulation[]> => {
  return await getData('historique_annulations') || [];
};

// Exemple d'utilisation : Suppression d'un patient
const deletePatientAndLogHistory = async (patient: Patient) => {
  await cancelPatient(patient);
  console.log(`Patient ${patient.nom} ${patient.prenom} annulé et ajouté à l'historique`);
};

// Récupérer tous les patients
export const getPatients = async (): Promise<Patient[]> => {
  const patients = await getData('patients');
  return patients ? Object.values(patients) : [];
};

export const saveNotificationsToStorage = (notifications: any[]) => {
  localStorage.setItem('notifications', JSON.stringify(notifications));
};

export const getNotificationsFromStorage = (): any[] => {
  const storedNotifications = localStorage.getItem('notifications');
  return storedNotifications ? JSON.parse(storedNotifications) : [];
};





// Initialiser l'a.dministrateur par défaut
initializeAdmin();