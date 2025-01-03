import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonText, IonList, IonItem, IonLabel, IonButton, IonInput, IonIcon, IonAvatar, IonBackButton, IonButtons } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { SMS } from '@ionic-native/sms';
import { send } from 'ionicons/icons'; // Assurez-vous d'importer l'icône de l'envoi

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
      // Ajouter le message localement
      setMessages((prevMessages) => [...prevMessages, `Me: ${message}`]);
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
        setMessages((prevMessages) => [...prevMessages, `Vous: ${welcomeMessage}`]); // Ajouter le message dans l'interface
      } catch (error) {
        console.error("Erreur lors de l'envoi du message: ", error);
      }
    }
  };
  

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>
            {`${patient.nom} ${patient.prenom}`}
            <IonText color="medium" style={{ display: 'block', fontSize: '14px', marginTop: '4px' }}>
              {`Numéro: ${patient.telephone}`}
            </IonText>
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList style={{ paddingBottom: '80px' }}>
          {messages.map((msg, index) => (
            <IonItem
              key={index}
              lines="none"
              style={{
                display: 'flex',
                justifyContent: msg.startsWith('Me:') ? 'flex-end' : 'flex-start',
                marginBottom: '10px',
              }}
            >
              {/* Avatar du patient */}
              {!msg.startsWith('Me:') && (
                <IonAvatar style={{ marginRight: '10px' }}>
                  <img src="" alt="avatar" />
                </IonAvatar>
              )}

              {/* Message */}
              <IonLabel color={msg.startsWith('Me:') ? 'primary' : 'medium'}>
                <p>{msg}</p>
              </IonLabel>

              {/* Avatar de l'utilisateur */}
              {msg.startsWith('Me:') && (
                <IonAvatar style={{ marginLeft: '10px' }}>
                  <img src="src/pages/images/doc.jpg" alt="avatar" />
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
