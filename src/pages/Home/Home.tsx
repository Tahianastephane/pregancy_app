import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonItem, IonLabel, IonIcon, IonRefresher, IonRefresherContent, IonFabButton, IonMenu, IonContent, IonList, IonMenuButton, IonButtons, IonTabBar, IonTabButton, IonToast, IonModal, IonButton, IonBadge, IonAvatar, IonMenuToggle } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pencil, trash, add, chatbox, colorPalette, home, statsChart, megaphone, notifications, checkmarkCircle, calendar, time } from 'ionicons/icons';
import { addMonths, isBefore } from 'date-fns';
import { decompressData ,compressData } from '../utils/storageUtils';
import * as pako from 'pako';
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

  

  const base64ToUint8Array = (base64: string): Uint8Array => {
    const binaryString = atob(base64);  // Décodage base64 en chaîne binaire
    const byteArray = new Uint8Array(binaryString.length);  // Création d'un tableau d'octets
    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);  // Remplissage du tableau d'octets
    }
    return byteArray;
  };
  
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
  


//   const updatePatient = (updatedPatient: any) => {
//   // Mise à jour dans la base de données locale ou API
//   const updatedPatientsList = patients.map((patient) =>
//     patient.id === updatedPatient.id ? updatedPatient : patient
//   );

//   // Mise à jour de l'état avec la nouvelle liste de patients
//   setPatients(updatedPatientsList);

//   // Vous pouvez aussi mettre à jour la base de données ici
//   // Par exemple, avec react-native-sqlite-storage
// };

  
  
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
      console.log('Suppression du patient avec le téléphone:', telephone); // Log du téléphone du patient à supprimer
      const jsonValue = await AsyncStorage.getItem('@patients');
      const patients: any[] = jsonValue != null ? JSON.parse(jsonValue) : [];
      const updatedPatients = patients.filter(patient => patient.telephone !== telephone);
      await savePatients(updatedPatients);
      setPatients(updatedPatients);
      console.log('Patient supprimé avec succès');
    } catch (e) {
      console.error('Erreur lors de la suppression du patient:', e);
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
      // Appeler la fonction pour récupérer les patients
      await getPatients();
    } catch (error) {
      console.error("Erreur lors de la récupération des patients lors du rafraîchissement:", error);
    } finally {
      // Appeler complete() après avoir fini le processus, même si une erreur se produit
      event.detail.complete();
    }
  };
  ;


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

  const navigateToAdvertisements = () => {
    history.push('/advertisements');
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
            <IonTitle>Home</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent pullingText="Tirer pour rafraîchir" refreshingSpinner="circles" />
          </IonRefresher>

          <h2>{patients.length > 2 ? 'Liste des patients' : 'Liste de patient'}</h2>
          <p>{storageMessage}</p>

          <IonList>
          {patients.length > 0 ? (
            patients.map((patient, index) => (
              <IonItem key={index}>
                <IonAvatar slot="start">
                  <img src={patient.rappel || 'https://via.placeholder.com/150'} alt={`${patient.nom} ${patient.prenom}`} />
                </IonAvatar>
                <IonLabel onClick={() => navigateToPatientActions(patient)}>
                  <h2>{`${patient.nom} ${patient.prenom}`}</h2>
                  <p>{`tel: ${patient.telephone}`}</p>
                </IonLabel>

                <IonIcon icon={pencil} slot="end" onClick={() => navigateToEditPatient(patient)} />
                <IonIcon icon={trash} slot="end" onClick={() => deletePatient(patient)} />
                
              </IonItem>
            ))
          ) : (
            <p>No patients added yet.</p>
            
          )}
        </IonList>
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
          <IonTabButton tab="advertisements" onClick={navigateToAdvertisements}>
            <IonIcon icon={megaphone} />
            <IonLabel>Publicity</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonPage>

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
          <p>No notifications.</p>
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
