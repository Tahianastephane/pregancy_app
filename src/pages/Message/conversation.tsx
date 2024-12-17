import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonList,
  IonText,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonAvatar
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { send } from 'ionicons/icons'; // Icône pour le bouton d'envoi
import { Plugins } from '@capacitor/core';
const { Sms } = Plugins;
 

const ConversationPage: React.FC = () => {
  const location = useLocation();
  const { patient } = location.state as { patient: any };

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  // Fonction pour envoyer un message via SMS
  const handleSendMessage = async () => {
    if (message.trim()) {
      // Ajouter le message localement
      setMessages((prevMessages) => [...prevMessages, `Me: ${message}`]);
      setMessage('');

      try {
        // Envoi du message via le plugin SMS
        await Sms.send({
          phoneNumber: patient.telephone,
          message: message,
        });
        console.log("Message envoyé avec succès!");
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
