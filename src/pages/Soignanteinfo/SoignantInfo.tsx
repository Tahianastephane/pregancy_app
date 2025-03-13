import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonSpinner, IonBackButton, IonButtons, IonButton } from '@ionic/react';
import { getAllSoignants, getSoignantByMatricule, Soignant } from '../database/database';
import { getData, storeData } from '../utils/storageUtils';
import { motion } from 'framer-motion';

const SoignantsList: React.FC = () => {
  const [soignants, setSoignants] = useState<Soignant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const fetchSoignants = async () => {
      try {
        const data = await getAllSoignants();
        setSoignants(data);
      } catch (error) {
        console.error('Erreur lors du chargement des soignants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSoignants();
  }, []);



  const handleSoignantClick = (soignant: Soignant) => {
    history.push({
      pathname: `/soignant`,
      state: { soignant },
    });
  };


  const handleLogout = async () => {
    
    // Attendre un court instant pour vous assurer que toutes les opérations sont terminées
    setTimeout(() => {
      // Rediriger vers la page de connexion après un délai
      history.push('/login');
    }, 10);  // Vous pouvez ajuster le délai selon le besoin
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
          <IonTitle>
      {soignants.length > 1 ? 'Liste des personnels' : 'Liste du personnel'}
    </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>Déconnexion</IonButton>
          </IonButtons>
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

        {isLoading ? (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <IonSpinner name="crescent" />
          </div>
        ) : (
          soignants.map((soignant) => (
            <IonCard key={soignant.matricule} onClick={() => handleSoignantClick(soignant)}>
              <IonCardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                
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

                <div>
                <IonCardSubtitle style={{ color: 'black' }}>
                  {soignant.nom}, {soignant.prenom}
                </IonCardSubtitle>

                  <br />
                  <IonCardTitle>
                    {soignant.matricule} - {soignant.cin}
                  </IonCardTitle>
                  <br />
                  <IonCardSubtitle style={{ color: 'black' }}>
                    {soignant.region}, {soignant.district}
                  </IonCardSubtitle>
                </div>
               
              </IonCardHeader>
            </IonCard>
          ))
        )}
      </IonContent>
    </IonPage>
  );
};

export default SoignantsList;
function setPassword(arg0: string) {
    throw new Error('Function not implemented.');
}

function setUsername(arg0: string) {
    throw new Error('Function not implemented.');
}

