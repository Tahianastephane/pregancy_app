import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonAvatar, IonIcon, IonButtons, IonMenuButton, IonBackButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatbox } from 'ionicons/icons';
import { motion } from 'framer-motion';

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

          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Messages</IonTitle>
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
                background: 'linear-gradient(45deg, #ff6f61, #6a5acd)', // Exemple de fond dégradé
                boxShadow: 'none'
              
         
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
                boxShadow: 'none'
              
         
              }}
            ></motion.div>

  {patients.map((patient, index) => {
    // Générer les initiales à partir du nom et prénom
    const initiales = `${patient.nom?.charAt(0) || ''}${patient.prenom?.charAt(0) || ''}`.toUpperCase();

    return (
      <IonItem key={index} button onClick={() => handleConversationClick(patient)}>
        <IonAvatar slot="start">
          {patient.rappel ? (
            // Si une image d'avatar est disponible
            <img src={patient.rappel} alt={`${patient.nom} ${patient.prenom}`} />
          ) : (
            // Sinon, afficher les initiales dans un cercle
            <div
              style={{
                backgroundColor: '#ccc',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '18px',
                height: '100%',
                width: '100%',
                borderRadius: '50%',
              }}
            >
              {initiales}
            </div>
          )}
        </IonAvatar>
        <IonLabel>
          <h2>{`${patient.nom} ${patient.prenom}`}</h2>
          <p>{`Numéro: ${patient.telephone}`}</p>
        </IonLabel>
        <IonIcon icon={chatbox} slot="end" />
      </IonItem>
    );
  })}
</IonList>

      </IonContent>
    </IonPage>
  );
};

export default MessagePage;
