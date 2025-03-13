import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonProgressBar,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonButton,
} from '@ionic/react';
import { calendar, checkmarkCircle, alertCircle, home, statsChart, search } from 'ionicons/icons';
import { isBefore, isAfter, format } from 'date-fns';
import { useHistory } from 'react-router';
import { motion } from 'framer-motion';

const Statistics: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [patientsPerDay, setPatientsPerDay] = useState<number>(0);
  const [appointmentsDonePerDay, setAppointmentsDonePerDay] = useState<number>(0);
  const [appointmentsMissedPerDay, setAppointmentsMissedPerDay] = useState<number>(0);
  const [completedAppointments, setCompletedAppointments] = useState<number>(0);
  const [patientsByMonth, setPatientsByMonth] = useState<any>({});
  const [showStatistics, setShowStatistics] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(''); // Mois sélectionné
 

    // Fonction pour changer le mois sélectionné
    const handleMonthSelect = (month: string) => {
      setSelectedMonth(month);
    };
  


  // Fonction pour récupérer les patients
  const getPatients = async () => {
    try {
      const storedPatients = localStorage.getItem('patients'); // Utiliser localStorage ou AsyncStorage
      if (storedPatients) {
        const parsedPatients = JSON.parse(storedPatients);
        setPatients(parsedPatients);
        calculateStatistics(parsedPatients);
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des patients :', error);
    }
  };

  // Fonction pour calculer les statistiques
  const calculateStatistics = (patients: any[]) => {
    let patientsCount = 0;
    let appointmentsDoneCount = 0;
    let appointmentsMissedCount = 0;
    let completedCount = 0;
    let patientsGroupedByMonth: any = {};

    patients.forEach((patient) => {
      const dateAjout = new Date(patient.dateAjout).toLocaleDateString();
      const ddr = new Date(patient.ddr); // Date de rendez-vous
      const dpa = new Date(patient.dpa); // Date prévue d'accouchement

      // Regrouper les patients par mois
      const monthKey = format(ddr, 'yyyy-MM'); // Format 'année-mois'
      if (!patientsGroupedByMonth[monthKey]) {
        patientsGroupedByMonth[monthKey] = [];
      }
      patientsGroupedByMonth[monthKey].push(patient);

      // Compter les patients ajoutés
      if (dateAjout) {
        patientsCount += 1;
      }

      // Vérifier si le rendez-vous est effectué ou manqué
      if (ddr) {
        const currentDate = new Date();
        const ddrDate = new Date(ddr);
      
        // Si le rendez-vous est avant aujourd'hui, il est manqué
        if (ddrDate < currentDate) {
          appointmentsMissedCount += 1;
        } 
        // Si le rendez-vous est après aujourd'hui, il est à venir (rendez-vous effectué)
        else if (ddr.toLocaleDateString() === currentDate.toLocaleDateString()) {
          appointmentsDoneCount[dateAjout] = (appointmentsDoneCount[dateAjout] || 0) + 1;
        }
      
      

        // Vérifier si le rendez-vous est terminé (atteindre les 9 mois)
        const monthsDifference = Math.floor((currentDate.getTime() - ddr.getTime()) / (1000 * 3600 * 24 * 30)); // Environ 30 jours par mois
        if (monthsDifference >= 9) {
          completedCount += 1; // Ajouter un rendez-vous comme terminé si 9 mois sont atteints
        }
      }

      // Calcul du pourcentage de grossesse
      if (dpa) {
        const monthsPassed = Math.floor((new Date().getTime() - ddr.getTime()) / (1000 * 3600 * 24 * 30));
        const totalPregnancyMonths = 9; // 9 mois de grossesse
        const progress = Math.min(monthsPassed / totalPregnancyMonths, 1); // Limiter la progression à 100%
        patient.progress = progress; // Ajout de la progression à chaque patient
      }
    });

    setPatientsPerDay(patientsCount);
    setAppointmentsDonePerDay(appointmentsDoneCount);
    setAppointmentsMissedPerDay(appointmentsMissedCount);
    setCompletedAppointments(completedCount);
    setPatientsByMonth(patientsGroupedByMonth);
  };

  useEffect(() => {
    getPatients();
  }, []);

  

  const renderStatisticContainer = (
    title: string,
    icon: string,
    value: number
  ) => (
    <div style={styles.statisticContainer}>
      <h3 style={styles.title}>{title}</h3>
      <ion-icon style={styles.icon} icon={icon}></ion-icon>
      <h1 style={styles.value}>{value}</h1>
    </div>
  );
  
  const addAppointment = (newAppointment: any) => {
    console.log('Ajout du rendez-vous:', newAppointment);
    const updatedPatients = [...patients];
    updatedPatients.push(newAppointment);
  
    // Vérifie les données après ajout
    console.log('Patients après ajout:', updatedPatients);
  
    localStorage.setItem('patients', JSON.stringify(updatedPatients));
  
    // Met à jour les statistiques
    calculateStatistics(updatedPatients);
  
    setPatients(updatedPatients); // Mette à jour l'état avec les nouveaux patients
  };
  
  
  
  


  const styles = {
    statisticContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #ccc',
      borderRadius: '10px',
      width: '100%',
      maxWidth: '300px',
      height: '200px',
      textAlign: 'center',
      margin: '0 auto',
    },
    title: {
      fontSize: '18px',
      marginBottom: '10px',
    },
    icon: {
      fontSize: '50px',
      color: '#3880ff',
    },
    value: {
      marginTop: '10px',
      fontWeight: 'bold',
      fontSize: '24px',
    },
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
          <IonTitle>Statistiques</IonTitle>
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
                background: 'linear-gradient(45deg, #ff6f61, #6a5acd)', 
                height: '115vh',// Exemple de fond dégradé
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
        <IonGrid>
          <IonRow>
            <IonCol size="6" className="ion-text-center">
              {renderStatisticContainer('Rendez-vous effectués', checkmarkCircle, appointmentsDonePerDay)}
            </IonCol>
            <IonCol size="6" className="ion-text-center">
              {renderStatisticContainer('Patientes ajoutés', calendar, patientsPerDay)}
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6" className="ion-text-center">
              {renderStatisticContainer('Rendez-vous terminés', checkmarkCircle, completedAppointments)}
            </IonCol>
            <IonCol size="6" className="ion-text-center">
              {renderStatisticContainer('Rendez-vous manqués', alertCircle, appointmentsMissedPerDay)}
            </IonCol>
          </IonRow>

          {/* Affichage des statistiques par mois */}
          <IonRow>
        <IonCol size="12" className="ion-text-center">
          {/* Bouton pour afficher ou masquer */}
          <IonButton
            onClick={() => setShowStatistics((prevState) => !prevState)}
            expand="block"
          >
            {showStatistics ? 'Masquer les statistiques' : 'Afficher les statistiques'}
          </IonButton>
        </IonCol>
      </IonRow>

      {/* Contenu des statistiques */}
      {showStatistics && (
       <IonRow>
       <IonCol size="12" className="ion-text-center">
         <h3 style={styles.monthlyStatsTitle}>Statistiques par mois</h3>
 
         {/* Affichage des boutons pour sélectionner les mois */}
         <IonRow>
           {Object.keys(patientsByMonth).map((month) => (
             <IonCol key={month} size="4">
               <IonButton
                 expand="block"
                 onClick={() => handleMonthSelect(month)}
                 style={{ marginBottom: '10px' }}
               >
                 {month}
               </IonButton>
             </IonCol>
           ))}
         </IonRow>
 
         {/* Affichage des statistiques pour le mois sélectionné */}
         {selectedMonth ? (
           patientsByMonth[selectedMonth] && patientsByMonth[selectedMonth].length > 0 ? (
             <IonCard style={styles.card}>
               <IonCardHeader style={styles.cardHeader}>
                 <h4>{selectedMonth}</h4>
               </IonCardHeader>
               <IonCardContent style={styles.cardContent}>
                 <p>Nombre de patient(e)s : {patientsByMonth[selectedMonth].length}</p>
               </IonCardContent>
             </IonCard>
           ) : (
             <p>Aucun patient ajouté dans ce mois.</p>
           )
         ) : (
           <p>Veuillez sélectionner un mois pour afficher les statistiques.</p>
         )}
       </IonCol>
     </IonRow>
     
          
          )}
        </IonGrid>
        
      </IonContent>
     </IonPage>
  );
};

export default Statistics;
