import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonItem, IonLabel, IonIcon, IonRefresher, IonRefresherContent, IonFabButton, IonMenu, IonContent, IonList, IonMenuButton, IonButtons, IonTabBar, IonTabButton, IonToast, IonModal, IonButton, IonBadge, IonAvatar } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pencil, trash, add, chatbox, colorPalette, home, statsChart, megaphone, notifications, checkmarkCircle } from 'ionicons/icons';
import { addMonths, isBefore } from 'date-fns';

const Home: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [storageMessage, setStorageMessage] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationMessages, setNotificationMessages] = useState<{ message: string, phone: string }[]>([]);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const history = useHistory();

   // Fonction pour récupérer les patients stockés et les trier par date d'ajout
   const getPatients = async () => {
    try {
      const storedPatients = await AsyncStorage.getItem('patients');
      if (storedPatients) {
        const parsedPatients = JSON.parse(storedPatients);
        // Trier les patients par date d'ajout (assurez-vous que `dateAjout` existe dans les données de chaque patient)
        const sortedPatients = parsedPatients.sort((a: any, b: any) => new Date(b.dateAjout).getTime() - new Date(a.dateAjout).getTime());
        setPatients(sortedPatients);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error('Erreur de récupération des patients:', error);
    }
  };

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

  const deletePatient = async (patient: any) => {
    try {
      const storedPatients = await AsyncStorage.getItem('patients');
      let patients = storedPatients ? JSON.parse(storedPatients) : [];
      patients = patients.filter((p: any) => p.telephone !== patient.telephone);

      await AsyncStorage.setItem('patients', JSON.stringify(patients));
      setPatients(patients);
    } catch (error) {
      setStorageMessage('Failed to delete patient.');
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
                {/* Avatar à gauche */}
                <IonAvatar slot="start">
                  <img src={patient.rappel || 'https://via.placeholder.com/150'} alt={`${patient.nom} ${patient.prenom}`} />
                </IonAvatar>

                {/* Informations sur le patient */}
                <IonLabel onClick={() => navigateToPatientActions(patient)}>
                  <h2>{`${patient.nom} ${patient.prenom}`}</h2>
                  <p>{`Numéro: ${patient.telephone}`}</p>
                </IonLabel>

                {/* Icônes pour modifier et supprimer */}
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
