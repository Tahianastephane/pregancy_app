import React, { useEffect, useRef, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonItem, IonLabel, IonIcon, IonRefresher, IonRefresherContent, IonFabButton, IonMenu, IonContent, IonList, IonMenuButton, IonButtons, IonTabBar, IonTabButton, IonToast, IonModal, IonButton, IonBadge, IonAvatar, IonMenuToggle, IonItemOption, IonItemOptions, IonItemSliding, IonSearchbar, IonText, IonBackButton, IonFooter } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pencil, trash, add, chatbox, colorPalette, home, statsChart, megaphone, notifications, checkmarkCircle, calendar, time, chevronForwardOutline, search, closeCircle, personCircle, closeCircleOutline } from 'ionicons/icons';
import { addMonths, isBefore } from 'date-fns';
import { decompressData ,compressData } from '../utils/storageUtils';
import * as pako from 'pako';
import { motion } from 'framer-motion';
import '../theme/variables.css'
// import { getNotificationsFromStorage, saveNotificationsToStorage } from '../database/database';
import Consultations from '../consultaitons/Consultations';


type Notification = {
  message: string;
  phone: string;
  seen: boolean;
};

type Patient = {
  telephone: any;
  id: number; // ou `any`, si nécessaire, mais `number` est préférable
  nom: string;
  rappel: string;
  prenom: string;
  status?: string; // status est optionnel ici, pour les patients annulés
 
};

const saveNotificationsToStorage = (notifications: any[]) => {
  console.log("Sauvegarde dans localStorage :", notifications);
  localStorage.setItem('notifications', JSON.stringify(notifications));
};

// Fonction pour charger les notifications depuis localStorage
const getNotificationsFromStorage = (): any[] => {
  const storedNotifications = localStorage.getItem('notifications');
  console.log("Chargement depuis localStorage :", storedNotifications); // Vérification du contenu du localStorage
  return storedNotifications ? JSON.parse(storedNotifications) : [];
};



const Home: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [storageMessage, setStorageMessage] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [patientToCancel, setPatientToCancel] = useState<Patient | null>(null); // Patient à annuler

  const slidingRef = useRef<HTMLIonItemSlidingElement>(null); 
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false); // Contrôle de la recherche
  const [isMenuAnimating, setMenuAnimating] = useState(false);
  const [historique, setHistorique] = useState<Patient[]>([]);
  const [showHistorique, setShowHistorique] = useState(false);
  const [notificationMessages, setNotificationMessages] = useState<any[]>([]);
  
   // Charger les notifications depuis localStorage au démarrage
   useEffect(() => {
    const storedNotifications = getNotificationsFromStorage();
    console.log("Notifications chargées depuis localStorage :", storedNotifications);
    setNotificationMessages(storedNotifications); // Met à jour l'état avec les notifications chargées
  }, []);

  // Sauvegarder dans localStorage à chaque changement dans notificationMessages
  useEffect(() => {
    console.log("Sauvegarde automatique dans localStorage :", notificationMessages);
    saveNotificationsToStorage(notificationMessages); // Sauvegarde les notifications mises à jour
  }, [notificationMessages]);

  // Marquer une notification comme vue
  const markNotificationAsSeen = (index: number) => {
    const updatedNotifications = [...notificationMessages];
    updatedNotifications[index].seen = true;

    console.log("Notification mise à jour : ", updatedNotifications);

    // Mettre à jour l'état local
    setNotificationMessages(updatedNotifications);

    // Sauvegarder immédiatement dans localStorage
    saveNotificationsToStorage(updatedNotifications);
  };

  // Supprimer une notification
  const deleteNotification = (index: number) => {
    const updatedNotifications = notificationMessages.filter((_, i) => i !== index);

    console.log("Notifications après suppression : ", updatedNotifications);

    // Mettre à jour l'état et sauvegarder dans localStorage
    setNotificationMessages(updatedNotifications);
    saveNotificationsToStorage(updatedNotifications);
  };

 
  

  
  const base64ToUint8Array = (base64: string): Uint8Array => {
    const binaryString = atob(base64);  // Décodage base64 en chaîne binaire
    const byteArray = new Uint8Array(binaryString.length);  // Création d'un tableau d'octets
    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);  // Remplissage du tableau d'octets
    }
    return byteArray;
  };

  

  const toggleSearchModal = () => {
    setIsSearchActive(!isSearchActive);
  };

   // Filtrage des patients selon le terme de recherche
   useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients([]);
    } else {
      const results = patients.filter((patient) =>
        `${patient.nom} ${patient.prenom} ${patient.telephone}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(results);
    }
  }, [searchTerm, patients]);
  
  const isValidBase64 = (str: string): boolean => {
    // Vérifie que la chaîne correspond au format base64
    try {
      return btoa(atob(str)) === str; // Essaye de décoder puis de réencoder
    } catch (e) {
      return false;
    }
  };
  
  const getPatients = async () => {
    try {
      const storedPatients = await AsyncStorage.getItem('patients');
      console.log("Données récupérées de AsyncStorage : ", storedPatients);
  
      if (storedPatients) {
        if (isValidBase64(storedPatients)) {
          // Convertir base64 en Uint8Array
          const byteArray = base64ToUint8Array(storedPatients);
  
          // Décompresser les données
          const decompressedData = pako.inflate(byteArray, { to: 'string' });
  
          // Convertir les données décompressées en JSON
          const patients = JSON.parse(decompressedData);
          console.log('Patients décompressés:', patients);
  
          // Mettre à jour l'état des patients
          setPatients(patients);
        } 
      } else {
        console.log("Aucun patient trouvé.");
        setPatients([]);  // Aucun patient trouvé dans AsyncStorage
      }
    } catch (error) {
      console.error("Erreur de récupération des patients:", error);
      setPatients([]);  // Réinitialiser en cas d'erreur
    }
  };

  // Fonction pour sauvegarder les patients
  const savePatients = async (patients: any[]) => {
    try {
      const jsonValue = JSON.stringify(patients);
      await AsyncStorage.setItem('patients', jsonValue);
      console.log('Patients sauvegardés avec succès');
    } catch (e) {
      console.error('Erreur lors de la sauvegarde des patients:', e);
    }
  };
  const addPatient = async (newPatient: any) => {
    // Vérifier si le patient existe déjà
    const patientExists = patients.some(patient => patient.telephone === newPatient.telephone);
  
    if (!patientExists) {
      const updatedPatients = [...patients, newPatient];
      setPatients(updatedPatients);
      await savePatients(updatedPatients);
    } else {
      console.log('Patient déjà existant');
    }
  }; 
const updatedPatient = async (updatedPatient: any) => {
  try {
    // Récupérer les patients stockés
    const storedPatients = await AsyncStorage.getItem('patients');
    let patients = [];
    
    if (storedPatients) {
      if (isValidBase64(storedPatients)) {
        // Décompresser les données si elles sont en base64
        const byteArray = base64ToUint8Array(storedPatients);
        const decompressedData = pako.inflate(byteArray, { to: 'string' });
        patients = JSON.parse(decompressedData);
      } else {
        patients = JSON.parse(storedPatients);
      }
      
      // Trouver l'index du patient à modifier
      const patientIndex = patients.findIndex((patient: any) => patient.telephone === updatedPatient.telephone);
      
      if (patientIndex !== -1) {
        // Mettre à jour les informations du patient sans duplication
        patients[patientIndex] = { ...patients[patientIndex], ...updatedPatient };
  
        // Sauvegarder les données mises à jour
        await savePatients(patients);
        
        // Mettre à jour l'état local des patients (assurez-vous que vous ne rajoutez pas un patient mais le mettez à jour)
        setPatients([...patients]);
      } else {
        console.error('Patient non trouvé.');
      }
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du patient:', error);
  }
};
  // Fonction pour récupérer les patients
  const retrievePatients = async () => {
    try {
      const storedPatients = await AsyncStorage.getItem('patients');
      console.log("Contenu de storedPatients avant parsing:", storedPatients);
  
      if (storedPatients) {
        try {
          if (isValidBase64(storedPatients)) {
            const patients = decompressData(storedPatients);
            return patients;
          } else {
            const patients = JSON.parse(storedPatients);
            return patients;
          }
        } catch (parseError) {
          console.error("Erreur de parsing des patients:", parseError);
          setStorageMessage('Erreur de parsing des patients.');
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des patients:", error);
      setStorageMessage('Échec de la récupération des patients.');
    }
    return [];
  };
  
  
const clearStorage = async () => {
  try {
    // Supprimer toutes les données du storage
    await AsyncStorage.clear();  
    console.log('Le stockage a été vidé.');

    // Vérifier si les données sont bien supprimées
    const value = await AsyncStorage.getItem('patients');
    if (value === null) {
      console.log('Toutes les données du storage ont été supprimées avec succès.');
    } else {
      console.log('Le stockage n\'a pas été vidé correctement.');
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du stockage:', error);
  }
};

  // Fonction pour réinitialiser les patients en cas de corruption des données
  const clearPatients = async () => {
    try {
      await AsyncStorage.removeItem('patients');
      console.log("Les données des patients ont été supprimées de AsyncStorage.");
      setPatients([]); // Mettre à jour l'état des patients à un tableau vide
    } catch (error) {
      console.error("Erreur lors de la suppression des données:", error);
    }
  };
  

  // Fonction pour supprimer un patient
  const deletePatient = async (telephone: string) => {
    try {
      console.log('Suppression du patient avec le téléphone:', telephone); // Log pour vérifier le téléphone
      const jsonValue = await AsyncStorage.getItem('patients'); // Utilisez 'patients' comme clé
      const storedPatients: any[] = jsonValue ? JSON.parse(jsonValue) : [];
      
      // Filtrer les patients pour exclure celui à supprimer
      const updatedPatients = storedPatients.filter(patient => patient.telephone !== telephone);
      
      // Si la liste des patients est vide après la suppression, ne sauvegardez rien
      if (updatedPatients.length === 0) {
        await AsyncStorage.removeItem('patients'); // Si tous les patients sont supprimés, on vide le stockage
      } else {
        // Sauvegarder les patients mis à jour dans AsyncStorage
        await savePatients(updatedPatients);
      }
  
      // Mettre à jour l'état local
      setPatients(updatedPatients);
  
      console.log('Patient supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du patient:', error);
    }
    slidingRef.current?.close();
  };
  
  const performHeavyTask = async () => {
    // Simulation d'une tâche lourde
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Tâche lourde terminée");
        resolve(true);
      }, 300);
    });
  };
  const resetPatientsStorage = async () => {
    await AsyncStorage.removeItem('patients');
    setPatients([]);  // Mettre à jour l'état des patients
    console.log('Les données des patients ont été réinitialisées.');
  }; 
  // Utilisation de la fonction retrievePatients
  useEffect(() => {
    const fetchPatients = async () => {
      const storedPatients = await AsyncStorage.getItem('patients');
      console.log("Contenu de storedPatients : ", storedPatients);
  
      if (storedPatients) {
        try {
          if (isValidBase64(storedPatients)) {
            const byteArray = base64ToUint8Array(storedPatients);
            const decompressedData = pako.inflate(byteArray, { to: 'string' });
            const patients = JSON.parse(decompressedData);
            setPatients(patients);  // Mettre à jour l'état des patients
          } else {
            const patients = JSON.parse(storedPatients);
            setPatients(patients);  // Mettre à jour l'état des patients
          }
        } catch (error) {
          console.error("Erreur de parsing des patients:", error);
          setPatients([]); // Réinitialiser en cas d'erreur de parsing
        }
      } else {
        setPatients([]);  // Si aucun patient n'est trouvé
      }
    };
  
    fetchPatients();
  }, []);  // Ne s'exécute qu'une fois lors du montage du composant
  
  useEffect(() => {
    if (toastMessage) {
      setShowToast(true);
    }
  }, [toastMessage]);
  
  useEffect(() => {
    const checkForNotifications = () => {
      const notifications: Notification[] = [];
      const currentDate = new Date();
  
      patients.forEach((patient) => {
        const ddr = patient.ddr;
        let rdvEffectue = patient.rdvEffectue; // Vérifier si rdvEffectue est bien défini
  
        // Log pour débogage
        console.log(`Patient: ${patient.nom} ${patient.prenom}, DDR: ${ddr}, rdvEffectue: ${rdvEffectue}`);
  
        // Si rdvEffectue est undefined ou null, le définir à false par défaut
        if (rdvEffectue === undefined || rdvEffectue === null) {
          rdvEffectue = false;
        }
  
        if (ddr) {
          const ddrDate = new Date(ddr);
          const nextAppointmentDate = addMonths(ddrDate, 1);
  
          // Vérifie si le rendez-vous est prévu aujourd'hui
          if (
            nextAppointmentDate.getDate() === currentDate.getDate() &&
            nextAppointmentDate.getMonth() === currentDate.getMonth() &&
            nextAppointmentDate.getFullYear() === currentDate.getFullYear()
          ) {
            if (rdvEffectue === true) {
              const message = `Rappel : Rendez-vous pour patiente ${patient.nom} ${patient.prenom} est effectué aujourd'hui. Date : ${nextAppointmentDate.toLocaleDateString()}`;
              notifications.push({ message, phone: patient.telephone, seen: false });
            } else {
              const message = `Rappel : Rendez-vous pour patiente ${patient.nom} ${patient.prenom} prévu aujourd'hui.`;
              notifications.push({ message, phone: patient.telephone, seen: false });
            }
          }
  
          // Vérifie si le rendez-vous est manqué
          if (isBefore(nextAppointmentDate, currentDate) && (currentDate.getTime() - nextAppointmentDate.getTime()) > 86400000) {
            if (rdvEffectue === false || rdvEffectue === null) {
              const missedMessage = `Rappel : Le patiente ${patient.nom} ${patient.prenom} n'était pas au rendez-vous du ${nextAppointmentDate.toLocaleDateString()}.`;
              notifications.push({ message: missedMessage, phone: patient.telephone, seen: false });
            }
          }
        }
      });
  
      setNotificationMessages(notifications);
      setNewNotificationsCount(notifications.length);
    };

        // Supprimer les notifications après 1 jour
        setTimeout(() => {
          setNotificationMessages((prevNotifications) => 
            prevNotifications.filter(notification => !notification.seen)
          );
        }, 86400000);  // 86400000 ms = 1 jour
      
    
  
    // Appel de la fonction
    checkForNotifications();
  }, [patients]);

  const handleNotificationClose = () => {
    setShowNotifications(false);
  };

  // const markNotificationAsSeen = (index: number) => {
  //   const updatedNotifications = [...notificationMessages];
  //   updatedNotifications[index].seen = true;
  //   setNotificationMessages(updatedNotifications);
  // };
    
  const handleNotificationClick = (index: number) => {
    setNotificationMessages((prevNotifications) => {
      const updatedNotifications = [...prevNotifications];
      if (!updatedNotifications[index].seen) {
        updatedNotifications[index].seen = true;
        setNewNotificationsCount((prevCount) => prevCount - 1); // Décrémente seulement quand un message est vu
      }
      return updatedNotifications;
    });
  };
  const loadHistorique = () => {
    const savedHistorique = localStorage.getItem('historique');
    return savedHistorique ? JSON.parse(savedHistorique) : [];
  };

  

  // Sauvegarder les patients dans le localStorage
  const saveHistoriqueToLocalStorage = (historique: any[]) => {
    try {
      localStorage.setItem('historique', JSON.stringify(historique));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'historique dans localStorage:', error);
    }
  };
  

  // Sauvegarder l'historique dans le localStorage
  const cancelPatient = (patient: Patient) => {
    // Mettre à jour l'historique
    const updatedHistorique = [...historique, { ...patient}];
    console.log("Historique après ajout:", updatedHistorique); // Log pour vérifier les données
  
    // Ajouter à l'historique
    setHistorique(updatedHistorique);
    saveHistoriqueToLocalStorage(updatedHistorique);
  
    // Filtrer le patient annulé de la liste des patients
    const updatedPatients = patients.filter(p => p.telephone !== patient.telephone);
    
    // Mettre à jour la liste des patients
    setPatients(updatedPatients);
    savePatients(updatedPatients);
    setPatientToCancel(patient); // On garde une trace du patient à annuler
    setShowAlert(true);
    slidingRef.current?.close();
  };
  
  
  
  
  
  

  const navigateToPatientActions = (patient: any) => {
    history.push({
      pathname: `/patient-details`,
      state: { patient },
    });
  };

  const navigateToEditPatient = (patient: any) => {
    if (patient && patient.ddr) {
      history.push({
        pathname: '/patient-form',
        state: { patient }, // Passe l'objet patient avec toutes ses données
      });
    } else {
      console.error('Données du patient invalides');
    }
    slidingRef.current?.close();
  };
  

  const handleMenuHistoriqueClick = () => {
    setShowHistorique(true);
  };

 
  
  const clearSpecificData = async (key: string) => {
    try {
      await AsyncStorage.removeItem(key); // Supprimer la clé spécifique
      console.log(`Données pour la clé "${key}" supprimées avec succès.`);
    } catch (error) {
      console.error("Erreur lors de la suppression de la clé :", key, error);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    try {
      // Recharger la page actuelle pour simuler un rafraîchissement complet (comme F5)
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
    } finally {
      // Appeler complete() pour indiquer que l'action de rafraîchissement est terminée
      event.detail.complete();
    }
  };
  
  const navigateToAddPatient = async () => {
    history.push('/patient-form');
    await performHeavyTask();
  };


  const handleMenuNotificationClick = () => {
    setShowNotifications(true);
    setNewNotificationsCount(0); // Réinitialiser le compte des nouvelles notifications lorsqu'elles sont consultées
  };

  const handleMenuMessageClick = (patientPhone: string) => {
    history.push({
      pathname: '/message',
      state: { patientPhone },
    });
  };

  const navigateToStatistics = () => {
    history.push('/statistics');
  };

  const navigateToSoignantInfo = () => {
    history.push('/soignant-info');
  };


  // const deleteNotification = (index: number) => {
  //   // Supprimer la notification par index
  //   setNotificationMessages((prevMessages) => {
  //     const updatedMessages = [...prevMessages];
  //     updatedMessages.splice(index, 1); // Retirer l'élément à l'index spécifié
  //     return updatedMessages;
  //   });
  
  //   // Réduire le nombre de notifications non lues
  //   setNewNotificationsCount((prevCount) => prevCount - 1);
  // };

  // Animation variants for the menu
  const menuVariants = {
    hidden: { opacity: 0, x: '-100%' },
    visible: {
      opacity: 1,
      x: [ '-50%', '0%' ],
      transition: {
        duration: 0.1,
        when: 'beforeChildren',
        staggerChildren: 0.1, // Delay for child animations
      },
    },
  };

  // Animation variants for menu items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };
  const handleMenuOpen = () => {
    setMenuAnimating(true);
  };

  const handleMenuClose = () => {
    setMenuAnimating(false); // Reset animation when menu closes
  };


  return (
    <>
       <IonMenu
       
      contentId="main-content"
      onIonDidOpen={handleMenuOpen} // Trigger animation on menu open
      onIonDidClose={handleMenuClose} // Optional: reset when menu closes
    >
      <IonHeader>
        <IonToolbar>
        <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1, // Placer l'arrière-plan en dessous du contenu
                background: 'linear-gradient(50deg, #79a7d3, #79a7d3)', // Dégradé linéaire avec la couleur #79a7d3
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'], // Animation du dégradé
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: 'loop', // Répétition infinie de l'animation
                ease: 'linear',
              }}
            ></motion.div>
          <IonTitle>Menu</IonTitle>
          
        </IonToolbar>
      </IonHeader>
      <IonContent  style={{
        backgroundColor: 'transparent', // Fond transparent
        color: 'black', // Ajustez la couleur du texte si nécessaire
      }}>
        
        <motion.div
         style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1, // Placer l'arrière-plan en dessous du contenu
          background: 'radial-gradient(circle, #79a7d3 50%, #ffffff 100%)',
          height: '101vh', // Dégradé avec du blanc au centre
        }}
          initial="hidden"
          animate={isMenuAnimating ? 'visible' : 'hidden'}
          variants={menuVariants}
        >
          <IonList>
          
            {/* Notifications */}
            <IonMenuToggle auto-hide="false" >
              
        <motion.div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: -1, // Placer l'arrière-plan en dessous du contenu
                    background: 'radial-gradient(circle, #79a7d3 50%, #ffffff 130%)',
                      
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'], // Animation du dégradé
                  }}

                  transition={{
                    duration: 10, // Durée de l'animation
                    repeatType: 'loop', // Boucle infinie
                    ease: 'linear', // Transition fluide
                  }}
                ></motion.div>
              
           
              <motion.div variants={itemVariants}>
                
                <IonItem button onClick={handleMenuNotificationClick} >
                  
                  
                  <IonIcon icon={notifications} slot="start" />
                  <IonLabel>Notifications</IonLabel>
                  {newNotificationsCount > 0 && (
                    <IonBadge color="danger" slot="end">{newNotificationsCount}</IonBadge>
                  )}
                </IonItem>
              </motion.div>
            </IonMenuToggle>

            {/* <IonMenuToggle auto-hide="false">
              <motion.div variants={itemVariants}>
              <IonItem button onClick={handleMenuHistoriqueClick}>
                  <IonIcon icon={time} slot="start" />
                  <IonLabel>Historique</IonLabel>
                </IonItem>
              </motion.div>
            </IonMenuToggle> */}


            {/* Message */}
            <IonMenuToggle auto-hide="false">
              <motion.div variants={itemVariants}>
                <IonItem button onClick={() => history.push('/message')}>
                  <IonIcon icon={chatbox} slot="start" />
                  <IonLabel>Message</IonLabel>
                </IonItem>
              </motion.div>
            </IonMenuToggle>

            {/* Consultations */}
            <IonMenuToggle auto-hide="false">
              <motion.div variants={itemVariants}>
                <IonItem button onClick={() => history.push('/Consultations')}>
                  <IonIcon icon={calendar} slot="start" />
                  <IonLabel>Consultations</IonLabel>
                </IonItem>
              </motion.div>
            </IonMenuToggle>



            {/* Historique */}
            

          </IonList>
        </motion.div>
      </IonContent >
    </IonMenu>

      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
          <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1, // Placer l'arrière-plan en dessous du contenu
                background: 'linear-gradient(45deg, #79a7d3, #79a7d3)', // Dégradé linéaire avec la couleur #79a7d3
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'], // Animation du dégradé
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: 'loop', // Répétition infinie de l'animation
                ease: 'linear',
              }}
            ></motion.div>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Page d'accueil</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
       
       
        <motion.div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: -1, // Placer l'arrière-plan en dessous du contenu
                    background: 'linear-gradient(45deg, #79a7d3 20%, #ffffff 30%, #79a7d3 80%)',
                    height: '114vh', // Dégradé avec du blanc au centre
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'], // Animation du dégradé
                  }}

                  transition={{
                    duration: 10, // Durée de l'animation
                    repeatType: 'loop', // Boucle infinie
                    ease: 'linear', // Transition fluide
                  }}
                ></motion.div>
                <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent pullingText="Tirer pour rafraîchir" refreshingSpinner="circles" />
          </IonRefresher>

          <h2>{patients.length > 1 ? 'Liste des patientes' : 'Liste de patiente'}</h2>

          <p>{storageMessage}</p>
          <IonList style={{ background: 'transparent', height: '100vh' }}>
  {patients.length > 0 ? (
    patients.map((patient, index) => {
      const initiales = `${patient.nom?.charAt(0) || ''}${patient.prenom?.charAt(0) || ''}`.toUpperCase();

      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <IonItemSliding  >
            <IonItem button >
              {patient.rappel ? (
                <IonAvatar slot="start">
                  <img src={patient.rappel} alt={`${patient.nom} ${patient.prenom}`} />
                </IonAvatar>
              ) : (
                <IonAvatar slot="start" style={{ backgroundColor: '#ced7d8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>{initiales}</span>
                </IonAvatar>
              )}
              <IonLabel onClick={() => navigateToPatientActions(patient)}>
              
                <p>{`${patient.nom} ${patient.prenom}`}</p>
                <h2>{`Tel : ${patient.telephone}`}</h2>
                
              </IonLabel>
              <IonIcon icon={chevronForwardOutline} slot="end" />
            </IonItem>
            <IonItemOptions slot="end">
              <IonItemOption color="warning" onClick={() => navigateToEditPatient(patient)}>
                <IonIcon slot="icon-only" icon={pencil} ></IonIcon>
              </IonItemOption>
              <IonItemOption color="danger" onClick={() => deletePatient(patient.telephone)}>
                <IonIcon slot="icon-only" icon={trash}></IonIcon>
              </IonItemOption>
              {/* <IonItemOption color="medium" onClick={() => cancelPatient(patient)}>
                <IonIcon slot="icon-only" icon={closeCircle}></IonIcon>
              </IonItemOption> */}
            </IonItemOptions>
          </IonItemSliding>
        </motion.div>
      );
    })
  ) : (
    <p>Pas encore de patiente ajoutée.</p>
  )}
</IonList>

  


</motion.div>

        </IonContent>

        <div style={{ position: 'fixed', bottom: '70px', left: '50%', transform: 'translateX(-50%)' }}>
          <IonFabButton onClick={navigateToAddPatient}>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
          
        </div>


        <IonFooter className="ion-no-border">
        
        <IonTabBar slot="bottom">
      
          
          <IonTabButton tab="home" onClick={handleRefresh} >
            
            <IonIcon icon={home} />
            <IonLabel>Home</IonLabel>
          </IonTabButton>
          <IonTabButton tab="statistics" onClick={navigateToStatistics}>
            <IonIcon icon={statsChart} />
            <IonLabel>Statistics</IonLabel>
          </IonTabButton>
          <IonTabButton tab="Rechercher" onClick={toggleSearchModal}>
          <IonIcon icon={search} />
          <IonLabel>Rechercher</IonLabel>
        </IonTabButton>
        <IonTabButton tab="soignant" onClick={navigateToSoignantInfo}>
        <IonIcon icon={personCircle} />
        <IonLabel>Personnel</IonLabel>
      </IonTabButton>
          {/* <IonTabButton tab="Rechercher" onClick={goToSearchPage}>
          <IonIcon icon={search} />
          <IonLabel>Rechercher</IonLabel>
         </IonTabButton> */}
           

       
        </IonTabBar>
        </IonFooter>
      </IonPage>
      <IonModal isOpen={isSearchActive}>
  <IonHeader>
    <IonToolbar>
    <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1, // Placer l'arrière-plan en dessous du contenu
                background: 'linear-gradient(50deg, #79a7d3, #79a7d3)', // Dégradé linéaire avec la couleur #79a7d3
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'], // Animation du dégradé
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: 'loop', // Répétition infinie de l'animation
                ease: 'linear',
              }}
            ></motion.div>


      <IonSearchbar
        value={searchTerm}
        onIonInput={(e) => setSearchTerm((e.target as unknown as HTMLInputElement).value)}
        placeholder="Recherchez un patient..."
        style={{
          background: 'transparent !important' 
        }}
      />
    </IonToolbar>
  </IonHeader>
  <IonContent>
    
<motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1, // Placer l'arrière-plan en dessous du contenu
                background: 'linear-gradient(45deg, #ff6f61, #6a5acd)', // Exemple de fond dégradé
                boxShadow: 'none'
              
         
              }}
            ></motion.div>

    {filteredPatients.length > 0 ? (
      <IonList>
        
<motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1, // Placer l'arrière-plan en dessous du contenu
                background: 'linear-gradient(45deg, #ff6f61, #6a5acd)', // Exemple de fond dégradé
                boxShadow: 'none'
              
         
              }}
            ></motion.div>

        {filteredPatients.map((patient, index) => (
          <IonItem key={index}>
            <IonAvatar slot="start">
                  <img
                    src={patient.rappel || 'https://via.placeholder.com/150'}
                    alt={`${patient.nom} ${patient.prenom}`}
                    onError={(e) =>
                      (e.currentTarget.src = 'https://via.placeholder.com/150')
                    }
                  />
                </IonAvatar>
            <IonLabel>
              {patient.nom} {patient.prenom} {patient.telephone}
            </IonLabel>
          </IonItem>
        ))}
      </IonList>
    ) : (
      <><br /><IonText className="ion-padding">Aucun résultat trouvé.</IonText></>
    )}
  </IonContent>
  <IonButton expand="full" onClick={toggleSearchModal}>
    Fermer
  </IonButton>
</IonModal>

   {/* Modal Historique */}
 

      <IonModal isOpen={showNotifications} onDidDismiss={() => setShowNotifications(false)}>
        
        <IonHeader>
          
          <IonToolbar>
            
<motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1, // Placer l'arrière-plan en dessous du contenu
                background: 'linear-gradient(50deg, #79a7d3, #79a7d3)', // Dégradé linéaire avec la couleur #79a7d3
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'], // Animation du dégradé
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: 'loop', // Répétition infinie de l'animation
                ease: 'linear',
              }}
            ></motion.div>

            <IonTitle>Notifications</IonTitle>
            <IonButton onClick={() => setShowNotifications(false)} slot="end" expand="block">
          Ferme
        </IonButton>
                  </IonToolbar>
                </IonHeader>
                <IonContent>
                  
<motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1, // Placer l'arrière-plan en dessous du contenu
                background: 'linear-gradient(45deg, #ff6f61, #6a5acd)', // Exemple de fond dégradé
                boxShadow: 'none',
                height:'150vh',
              
         
              }}
            ></motion.div>
                <IonList>
                  
<motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1, // Placer l'arrière-plan en dessous du contenu
                background: 'linear-gradient(45deg, #ff6f61, #6a5acd)', // Exemple de fond dégradé
                boxShadow: 'none',
                height:'150vh'
              
         
              }}
            ></motion.div>
      {notificationMessages.length > 0 ? (
        notificationMessages.map((notification, index) => (
          <IonItem key={index} onClick={() => markNotificationAsSeen(index)}>
            <IonLabel>{notification.message}</IonLabel>
            {!notification.seen && <IonBadge color="danger">Nouveau</IonBadge>} {/* Afficher le badge si non vu */}
            {notification.seen && (
              <IonIcon 
                icon={closeCircleOutline} 
                onClick={(event) => {
                  event.stopPropagation(); // Empêche la propagation de l'événement
                  deleteNotification(index); // Supprime la notification
                }} 
                style={{ cursor: 'pointer', marginLeft: '10px' }} // Ajout de la souris en forme de pointeur et espacement
              />
            )}
          </IonItem>
        ))
      ) : (
        <p>Aucune notification.</p>
      )}
    </IonList>     
    </IonContent>
      </IonModal>

      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={3000}
        onDidDismiss={() => setShowToast(false)}
      />
    </>
  );
};

export default Home;
function setMenuAnimating(arg0: boolean) {
  throw new Error('Function not implemented.');
}

function saveHistoriqueToLocalStorage(updatedHistorique: Patient[]) {
  throw new Error('Function not implemented.');
}

function setShowAlert(arg0: boolean) {
  throw new Error('Function not implemented.');
}

