import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonItem, IonLabel, IonIcon, IonRefresher, IonRefresherContent, IonFabButton, IonMenu, IonContent, IonList, IonMenuButton, IonButtons, IonTabBar, IonTabButton, IonToast, IonModal, IonButton, IonBadge, IonAvatar, IonMenuToggle } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pencil, trash, add, chatbox, colorPalette, home, statsChart, megaphone, notifications, checkmarkCircle, calendar, time } from 'ionicons/icons';
import { addMonths, isBefore } from 'date-fns';
import { decompressData ,compressData } from '../utils/storageUtils';
import * as pako from 'pako';


const Home: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [storageMessage, setStorageMessage] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationMessages, setNotificationMessages] = useState<{ message: string, phone: string }[]>([]);
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
  
  const isValidBase64 = (str: string) => {
    const base64Pattern = /^[A-Za-z0-9+/=]+$/;
    return base64Pattern.test(str);
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
        } else {
          console.error("Données base64 incorrectes.");
          setPatients([]);  // Réinitialiser les patients en cas de format incorrect
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
      // Convertir les patients en JSON string
      const jsonString = JSON.stringify(patients);
  
      // Compresser les données JSON sans l'option 'to'
      const compressedData = pako.deflate(jsonString);
  
      // Convertir en base64 pour le stockage
      const base64String = btoa(String.fromCharCode(...compressedData));
  
      // Sauvegarder en AsyncStorage
      await AsyncStorage.setItem('patients', base64String);
      console.log('Patients enregistrés en base64');
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des patients:", error);
    }
  };
  
  
  
  const addPatient = async (newPatient: any) => {
    const updatedPatients = [...patients, newPatient];
    setPatients(updatedPatients);
    await savePatients(updatedPatients);
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
  const deletePatient = async (patient: any) => {
    try {
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
  
        // Filtrer et supprimer le patient
        patients = patients.filter((p: any) => p.telephone !== patient.telephone);
  
        // Sauvegarder les données mises à jour
        await savePatients(patients);  // Utiliser savePatients pour sauvegarder la liste des patients mise à jour
  
        // Mettre à jour l'état des patients
        setPatients(patients);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du patient:', error);
    }
  };
  
  

  const resetPatientsStorage = async () => {
    await AsyncStorage.removeItem('patients');
    setPatients([]);  // Mettre à jour l'état des patients
    console.log('Les données des patients ont été réinitialisées.');
  };
  
  
  // Utilisation de la fonction retrievePatients
  useEffect(() => {
    const fetchPatients = async () => {
      const patientsData = await retrievePatients();
      setPatients(patientsData);
    };
    fetchPatients();
  }, []);

  
  useEffect(() => {
    getPatients();
  }, []);

  useEffect(() => {
    const checkForNotifications = () => {
      const notifications: { message: string, phone: string }[] = [];
      let newCount = 0;
      const currentDate = new Date();

      patients.forEach((patient) => {
        const ddr = patient.ddr;
        if (ddr) {
          const ddrDate = new Date(ddr);
          const nextAppointmentDate = addMonths(ddrDate, 1);

          // Vérification du rendez-vous d'aujourd'hui
          if (
            nextAppointmentDate.getDate() === currentDate.getDate() &&
            nextAppointmentDate.getMonth() === currentDate.getMonth() &&
            nextAppointmentDate.getFullYear() === currentDate.getFullYear()
          ) {
            const message = `Rappel : Rendez-vous pour patient ${patient.nom} ${patient.prenom} prévu aujourd'hui.`;
            notifications.push({ message, phone: patient.telephone });
            newCount += 1;
          }

          // Vérification du rendez-vous manqué (plus de 1 jour passé)
          if (isBefore(ddrDate, currentDate) && (currentDate.getTime() - ddrDate.getTime()) > 86400000) { // 86400000 ms = 1 jour
            const missedMessage = `Rappel : Le patient ${patient.nom} ${patient.prenom} n'était pas au rendez-vous du ${ddrDate.toLocaleDateString()}.`;
            notifications.push({ message: missedMessage, phone: patient.telephone });
            newCount += 1;
          }
        }
      });

      setNotificationMessages(notifications);
      setNewNotificationsCount(newCount);
    };

    checkForNotifications();

  }, [patients]);

  const navigateToPatientActions = (patient: any) => {
    history.push({
      pathname: `/patient-details`,
      state: { patient },
    });
  };

  const navigateToEditPatient = (patient: any) => {
    history.push({
      pathname: `/patient-form`,
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
  await getPatients();
  event.detail.complete();
};


  const navigateToAddPatient = () => {
    history.push('/patient-form');
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
            <IonItem button onClick={handleMenuNotificationClick}>
              <IonIcon icon={notifications} slot="start" />
              <IonLabel>Notifications</IonLabel>
              {newNotificationsCount > 0 && (
                <IonBadge color="danger" slot="end">{newNotificationsCount}</IonBadge>
              )}
            </IonItem>
            <IonItem button onClick={() => history.push('/message')}>
              <IonIcon icon={chatbox} slot="start" />
              <IonLabel>Message</IonLabel>
            </IonItem>
            <IonMenuToggle auto-hide="false">
            <IonItem routerLink="/consultations" routerDirection="none">
              <IonIcon slot="start" icon={calendar} />
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
                <IonLabel onClick={() => history.push(`/patient-details`, { state: { patient } })}>
                  <h2>{`${patient.nom} ${patient.prenom}`}</h2>
                  <p>{`tel: ${patient.telephone}`}</p>
                </IonLabel>

                <IonIcon icon={pencil} slot="end" onClick={() => history.push(`/patient-form`, { state: { patient } })} />
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
                <IonItem key={index}>
                  <IonLabel onClick={() => handleMenuMessageClick(notification.phone)}>
                    {notification.message}
                  </IonLabel>
                  <IonIcon icon={checkmarkCircle} slot="end" onClick={() => deleteNotification(index)} />
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
