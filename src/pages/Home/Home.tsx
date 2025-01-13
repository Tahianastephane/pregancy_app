import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonItem, IonLabel, IonIcon, IonRefresher, IonRefresherContent, IonFabButton, IonMenu, IonContent, IonList, IonMenuButton, IonButtons, IonTabBar, IonTabButton, IonToast, IonModal, IonButton, IonBadge, IonAvatar, IonMenuToggle, IonItemOption, IonItemOptions, IonItemSliding, IonSearchbar, IonText, IonBackButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pencil, trash, add, chatbox, colorPalette, home, statsChart, megaphone, notifications, checkmarkCircle, calendar, time, chevronForwardOutline, search } from 'ionicons/icons';
import { addMonths, isBefore } from 'date-fns';
import { decompressData ,compressData } from '../utils/storageUtils';
import * as pako from 'pako';
import { motion } from 'framer-motion';
import Consultations from '../consultaitons/Consultations';

type Notification = {
  message: string;
  phone: string;
  seen: boolean;
};


const Home: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [storageMessage, setStorageMessage] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationMessages, setNotificationMessages] = useState<{
    seen: any; message: string, phone: string }[]>([]);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false); // Contrôle de la recherche


  
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
        `${patient.nom} ${patient.prenom}`
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
      
      // Sauvegarder les patients mis à jour dans AsyncStorage
      await savePatients(updatedPatients);
      
      // Mettre à jour l'état local
      setPatients(updatedPatients);
      
      console.log('Patient supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du patient:', error);
    }
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
              const message = `Rappel : Rendez-vous pour patient ${patient.nom} ${patient.prenom} est effectué aujourd'hui. Date : ${nextAppointmentDate.toLocaleDateString()}`;
              notifications.push({ message, phone: patient.telephone, seen: false });
            } else {
              const message = `Rappel : Rendez-vous pour patient ${patient.nom} ${patient.prenom} prévu aujourd'hui.`;
              notifications.push({ message, phone: patient.telephone, seen: false });
            }
          }
  
          // Vérifie si le rendez-vous est manqué
          if (isBefore(nextAppointmentDate, currentDate) && (currentDate.getTime() - nextAppointmentDate.getTime()) > 86400000) {
            if (rdvEffectue === false || rdvEffectue === null) {
              const missedMessage = `Rappel : Le patient ${patient.nom} ${patient.prenom} n'était pas au rendez-vous du ${nextAppointmentDate.toLocaleDateString()}.`;
              notifications.push({ message: missedMessage, phone: patient.telephone, seen: false });
            }
          }
        }
      });
  
      setNotificationMessages(notifications);
      setNewNotificationsCount(notifications.length);
    };
  
    // Appel de la fonction
    checkForNotifications();
  }, [patients]);

  const handleNotificationClose = () => {
    setShowNotifications(false);
  };

  const markNotificationAsSeen = (index: number) => {
    const updatedNotifications = [...notificationMessages];
    updatedNotifications[index].seen = true;
    setNotificationMessages(updatedNotifications);
  };
    
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
  

  const navigateToPatientActions = (patient: any) => {
    history.push({
      pathname: `/patient-details`,
      state: { patient },
    });
  };

  const navigateToEditPatient = (patient: any) => {
    history.push({
      pathname: '/patient-form',  // Utilisez des guillemets autour de la chaîne
      state: { patient },
    });
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

  const goToSearchPage = () => {
    history.push('/recherche');
  };


  const deleteNotification = (index: number) => {
    // Supprimer la notification par index
    setNotificationMessages((prevMessages) => {
      const updatedMessages = [...prevMessages];
      updatedMessages.splice(index, 1); // Retirer l'élément à l'index spécifié
      return updatedMessages;
    });
  
    // Réduire le nombre de notifications non lues
    setNewNotificationsCount((prevCount) => prevCount - 1);
  };

  return (
    <>
      <IonMenu contentId="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
          <IonMenuToggle auto-hide="false">
          <IonItem button onClick={handleMenuNotificationClick}>
            <IonIcon icon={notifications} slot="start" />
            <IonLabel>Notifications</IonLabel>
            {newNotificationsCount > 0 && (
              <IonBadge color="danger" slot="end">{newNotificationsCount}</IonBadge>
            )}
          </IonItem>
          </IonMenuToggle>
          <IonMenuToggle auto-hide="false">
            <IonItem button onClick={() => history.push('/message')}>
              <IonIcon icon={chatbox} slot="start" />
              <IonLabel>Message</IonLabel>
            </IonItem>
          </IonMenuToggle>
            <IonMenuToggle auto-hide="false">
            <IonItem button onClick={() => history.push('/Consultations')}>
              <IonIcon icon={calendar} slot="start" />
              <IonLabel>Consultations</IonLabel>
            </IonItem>
          </IonMenuToggle>
          <IonMenuToggle auto-hide="false">
            <IonItem routerLink="/historique" routerDirection="none">
              <IonIcon slot="start" icon={time} />
              <IonLabel>Historique</IonLabel>
            </IonItem>
          </IonMenuToggle>
          </IonList>
        </IonContent>
      </IonMenu>

      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Page d'accueil</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
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
        
    <IonList>
      {patients.length > 0 ? (
        patients.map((patient, index) => {
          const initiales = `${patient.nom?.charAt(0) || ''}${patient.prenom?.charAt(0) || ''}`.toUpperCase();

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}   // Initialisation de l'animation (invisible, décalé)
              animate={{ opacity: 1, y: 0 }}     // Animation finale (opacité à 1, décalage à 0)
              transition={{ delay: index * 0.1, duration: 0.5 }} // Délais pour chaque item et durée de l'animation
            >
              <IonItemSliding>
                <IonItem button>
                  {patient.rappel ? (
                    <IonAvatar slot="start">
                      <img src={patient.rappel} alt={`${patient.nom} ${patient.prenom}`} />
                    </IonAvatar>
                  ) : (
                    <IonAvatar slot="start" style={{ backgroundColor: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>{initiales}</span>
                    </IonAvatar>
                  )}
                  <IonLabel onClick={() => navigateToPatientActions(patient)}>
                    <h2>{`${patient.nom} ${patient.prenom}`}</h2>
                    <p>{`Tel: ${patient.telephone}`}</p>
                  </IonLabel>
                  <IonIcon icon={chevronForwardOutline} slot="end" />
                </IonItem>
                <IonItemOptions slot="end">
                  <IonItemOption color="warning" onClick={() => navigateToEditPatient(patient)}>
                    <IonIcon slot="icon-only" icon={pencil}></IonIcon>
                  </IonItemOption>
                  <IonItemOption color="danger" onClick={() => deletePatient(patient)}>
                    <IonIcon slot="icon-only" icon={trash}></IonIcon>
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            </motion.div>
          );
        })
      ) : (
        <p>Pas encore de patientes ajoutées.</p>
      )}
    </IonList>
  


</motion.div>

        </IonContent>

        <div style={{ position: 'fixed', bottom: '70px', left: '50%', transform: 'translateX(-50%)' }}>
          <IonFabButton onClick={navigateToAddPatient}>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </div>

        <IonTabBar slot="bottom">
          <IonTabButton tab="home" onClick={handleRefresh}>
            <IonIcon icon={home} />
            <IonLabel>Home</IonLabel>
          </IonTabButton>
          <IonTabButton tab="statistics" onClick={navigateToStatistics}>
            <IonIcon icon={statsChart} />
            <IonLabel>Statistics</IonLabel>
          </IonTabButton>
          <IonTabButton tab="Rechercher" onClick={goToSearchPage}>
          <IonIcon icon={search} />
          <IonLabel>Rechercher</IonLabel>
         </IonTabButton>
          {/* <IonTabButton tab="Rechercher" onClick={toggleSearchModal}>
          <IonIcon icon={search} />
          <IonLabel>Rechercher</IonLabel>
        </IonTabButton> */}

       
        </IonTabBar>
      </IonPage>
            {/* <IonModal isOpen={isSearchActive} onDidDismiss={toggleSearchModal}>
        <IonHeader>
          <IonToolbar>
            <IonSearchbar
              value={searchTerm}
              onIonInput={(e) => setSearchTerm((e.target as unknown as HTMLInputElement).value)}
              placeholder="Recherchez un patient..."
            />
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {filteredPatients.length > 0 ? (
            <IonList>
              {filteredPatients.map((patient, index) => (
                <IonItem key={index}>
                  <IonLabel>
                    {patient.nom} {patient.prenom}
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          ) : (
            <IonText className="ion-padding">Aucun résultat trouvé.</IonText>
          )}
        </IonContent>
        <IonButton expand="full" onClick={toggleSearchModal}>
          Fermer
        </IonButton>
      </IonModal> */}


      <IonModal isOpen={showNotifications} onDidDismiss={() => setShowNotifications(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Notifications</IonTitle>
            <IonButton onClick={() => setShowNotifications(false)} slot="end">Ferme</IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
      <IonList>
        {notificationMessages.length > 0 ? (
          notificationMessages.map((notification, index) => (
            <IonItem key={index} onClick={() => markNotificationAsSeen(index)}>
                <IonLabel>{notification.message}</IonLabel>
                {!notification.seen && <IonBadge color="danger">Nouveau</IonBadge>}
              </IonItem>
          ))
        ) : (
          <p>aucun notifications.</p>
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
