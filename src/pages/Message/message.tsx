import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonAvatar, IonIcon, IonButtons, IonMenuButton, IonBackButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatbox } from 'ionicons/icons';

const MessagePage: React.FC = () => {
  const history = useHistory();
  const [patients, setPatients] = useState<any[]>([]);

  // Fonction pour récupérer les patients stockés
  const getPatients = async () => {
    try {
      const storedPatients = await AsyncStorage.getItem('patients');
      if (storedPatients) {
        setPatients(JSON.parse(storedPatients));
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error('Erreur de récupération des patients:', error);
    }
  };

  useEffect(() => {
    getPatients();  // Récupérer les patients au chargement de la page
  }, []);

  const handleConversationClick = (patient: any) => {
    history.push({
      pathname: '/conversation',
      state: { patient },
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Messages</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          {patients.map((patient, index) => (
            <IonItem key={index} button onClick={() => handleConversationClick(patient)}>
              <IonAvatar slot="start">
                {/* Affiche l'avatar du patient ou une image par défaut */}
                <img src={patient.rappel|| 'https://via.placeholder.com/150'} alt={`${patient.nom} ${patient.prenom}`} />
              </IonAvatar>
              <IonLabel>
                <h2>{`${patient.nom} ${patient.prenom}`}</h2>
                <p>{`Numéro: ${patient.telephone}`}</p>
              </IonLabel>
              <IonIcon icon={chatbox} slot="end" />
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default MessagePage;
