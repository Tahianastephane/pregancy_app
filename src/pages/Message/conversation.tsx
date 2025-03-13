import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonText, IonList, IonItem, IonLabel, IonButton, IonInput, IonIcon, IonAvatar, IonBackButton, IonButtons } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { SMS } from '@ionic-native/sms';
import { send } from 'ionicons/icons'; // Assurez-vous d'importer l'icône de l'envoi
import { getMessages, saveMessage } from '../database/database';
import { motion } from 'framer-motion';

interface LocationState {
  patient: {
    nom: string;
    prenom: string;
    telephone: string;
  };
}

const ConversationPage: React.FC = () => {
  const location = useLocation();

  // Vérifier si location.state existe avant de le déstructurer
  const patient = location.state ? (location.state as LocationState).patient : null;

  // Si patient est nul, retourner un message d'erreur ou rediriger
  if (!patient) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Erreur</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonText color="danger">
            <p>Erreur : Aucun patient trouvé.</p>
          </IonText>
        </IonContent>
      </IonPage>
    );
  }

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  // Fonction pour envoyer un message via SMS
  const handleSendMessage = async () => {
    if (message.trim()) {
      const newMessage = {
        id_patient: patient.telephone,
        envoyer: 'true',
        message: message,
        date_envoie: new Date().toISOString(), // Date actuelle
      };
  
      // Sauvegarder le message dans la base de données
      await saveMessage(newMessage);
      // Ajouter le message localement
      setMessages((prevMessages) => [...prevMessages, ` ${message}`]);
      setMessage('');
  
      // Construire le message de bienvenue personnalisé avec le nom du patient
      const welcomeMessage = `Bonjour ${patient.nom} ${patient.prenom}, c'est le Pregnancy App. ${message}`;
  
      // Ajouter l'indicatif international (+261 pour Madagascar)
      let phoneNumber = patient.telephone;
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+261' + phoneNumber.substring(1); // Suppose que le numéro commence par un 0
      }
  
      try {
        // Envoi du message via le plugin SMS avec le message de bienvenue
        await SMS.send(phoneNumber, welcomeMessage, {
          replaceLineBreaks: false,
          android: {
            intent: 'INTENT', // Ou 'SEND' pour envoyer directement
          },
        });
        console.log("Message envoyé avec succès!");
        setMessages((prevMessages) => [...prevMessages, ` ${welcomeMessage}`]); // Ajouter le message dans l'interface
      } catch (error) {
        console.error("Erreur lors de l'envoi du message: ", error);
      }
    }
  };

  React.useEffect(() => {
    const loadMessages = async () => {
      const allMessages = await getMessages();
      const patientMessages = allMessages.filter((msg: any) => msg.id_patient === patient.telephone);
      const formattedMessages = patientMessages.map((msg: any) =>
        msg.envoyer === 'true' ? ` ${msg.message}` : `Patient: ${msg.message}`
      );
      setMessages(formattedMessages);
    };
  
    loadMessages();
  }, [patient.telephone]);
  
  

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
          <IonTitle>
            {`${patient.nom} ${patient.prenom}`}
            <IonText color="white" style={{ display: 'block', fontSize: '14px', marginTop: '4px' }}>
              {`Numéro: ${patient.telephone}`}
            </IonText>
          </IonTitle>
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

      <IonList style={{ paddingBottom: '80px' }}>
        
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

        {messages.map((msg, index) => (
          <IonItem
            key={index}
            lines="none"
            style={{
              display: 'flex',
              justifyContent: msg.startsWith('') ? 'flex-end' : 'flex-start',
              marginBottom: '10px',
            }}
          >
            {!msg.startsWith('') && (
              <IonAvatar style={{ marginRight: '10px' }}>
                <img src="" alt="avatar" />
              </IonAvatar>
            )}
            <IonLabel color={msg.startsWith('') ? 'primary' : 'medium'}>
              <p>{msg}</p>
            </IonLabel>
            {msg.startsWith('') && (
              <IonAvatar style={{ marginLeft: '10px' }}>
                <img src="src/pages/images/soignante.jpeg" alt="avatar" />
              </IonAvatar>
            )}
          </IonItem>
        ))}
      </IonList>

        {/* Champ de message et bouton d'envoi */}
        <IonItem style={{ position: 'fixed', bottom: '0', width: '100%', padding: '10px' }}>
          <IonInput
            value={message}
            onIonChange={(e) => setMessage(e.detail.value!)}
            placeholder="Tapez un message"
            clearInput
          />
          <IonButton onClick={handleSendMessage} color="primary" fill="solid">
            <IonIcon icon={send} />
          </IonButton>
        </IonItem>
      </IonContent>
    </IonPage>
  );
};

export default ConversationPage;
