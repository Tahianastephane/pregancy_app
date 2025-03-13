import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonBackButton, IonButtons } from '@ionic/react';
import { motion } from 'framer-motion';

const Soignantdetails: React.FC = () => {
  const location = useLocation<{ soignant: any }>(); // Récupère les données passées via history.push
  const history = useHistory();

  const soignant = location.state?.soignant;

  if (!soignant) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Erreur</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <p>Impossible de trouver les détails du soignant. Retournez à la liste des soignants.</p>
          <button onClick={() => history.goBack()}>Retour</button>
        </IonContent>
      </IonPage>
    );
  }

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
          <IonTitle>Informations du personnel</IonTitle>
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

        <IonCard>
          <IonCardHeader>
            
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

          <p style={{ color: 'black' }}>Nom : {soignant.nom}</p>
            <p style={{ color: 'black' }}>Prénom : {soignant.prenom}</p>
            <p style={{ color: 'black' }}>Contact : {soignant.contact}</p>
            <p style={{ color: 'black' }}>Région : {soignant.region}</p>
            <p style={{ color: 'black' }}>District : {soignant.district}</p>
            <p style={{ color: 'black' }}>Commune : {soignant.commune}</p>
            <IonCardTitle style={{ color: 'black' }}>Matricule : {soignant.matricule}</IonCardTitle>
            <IonCardTitle style={{ color: 'black' }}>CIN : {soignant.cin}</IonCardTitle>
          </IonCardHeader>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Soignantdetails;
