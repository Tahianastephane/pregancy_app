import React, { useState, useEffect, useRef } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonItem, IonButton, IonButtons, IonBackButton, IonGrid, IonRow, IonCol, IonModal, IonCheckbox, IonInput, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonProgressBar } from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { motion } from 'framer-motion';
import { closeOutline } from 'ionicons/icons';
import './styleChecks.css';

interface Rendezvous {
  date: string;
  statut: boolean; // `true` pour effectué, `false` pour non effectué
}

// Définir l'interface Patient pour garantir que l'objet a la bonne forme
interface Patient {
  nextAppointment: string | number | null | undefined;
  telephone: any;
  nom: string;
  prenom: string;
  age: number;
  marie: string;
  region: string;
  adresse: string;
  cin: string;
  profession: string,
  nbcpn: number,
  csb:string,
  prestataire: string,
  date_dernier_accouchement: string;
  nombre_enfants_vivants: number;
  ddr: string;
  dpa: string;
  cpn: number;
  rappel: string;
  antecedent?: any;
  rendezvous: Rendezvous[]; // Ajout de la propriété 'antecedent' de type any
}
interface Rendezvous {
  date: string;
  statut: boolean; // `true` pour effectué, `false` pour non effectué
  note: string; // Note ajoutée au rendez-vous
}




const calculateWeeksBetween = (start: Date, end: Date) => {
  const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor((end.getTime() - start.getTime()) / millisecondsPerWeek);
};
// Définir un type pour le state de useLocation avec la structure spécifique attendue
interface LocationState {
  patient: Patient;
}

const PatientDetails: React.FC = () => {
  const location = useLocation<LocationState>(); // Utiliser le type LocationState pour `useLocation`
  const history = useHistory();
 

  // Vérifier si patient est disponible dans le state
  

  // Initialisation de l'état answers avec toutes les cases à cocher décochées par défaut
  const [answers, setAnswers] = useState<any>({
    ageInferieur18Ans: undefined,
    ageSuperieur38Ans: undefined,
    primipareAgeePlus35Ans: undefined,
    pariteSuperieure5: undefined,
    dernierAccouchementMoins2Ans: undefined,
    bassinRetreciAsymetrique: undefined,
    taSup148: undefined,
    diabete: undefined,
    dyspnee: undefined,
    intervention: undefined,
    grossesseGemellaire: undefined,
    antecedent: undefined,
    mortNe: undefined,
    faussesCouches: undefined,
    habitude: undefined,
    autreAntecedent: '', // Ajout du champ texte pour d'autres antécédents
  });

  const [isAntecedentAdded, setIsAntecedentAdded] = useState<boolean>(false); // État pour savoir si l'antécédent est ajouté
  const [patients, setPatients] = useState<any[]>([]);
  const modalPatientDetails = useRef<HTMLIonModalElement>(null);
  const modalAntecedents = useRef<HTMLIonModalElement>(null);
  const [patient, setPatient] = useState<Patient | undefined>(location.state?.patient || { ddr: '', dpa: '' });
  const [notes, setNotes] = useState<string>('');
  

  
 
  // Fonction pour récupérer la liste des patients depuis AsyncStorage
const getPatients = async () => {
    try {
      const storedPatients = await AsyncStorage.getItem('patients');
      const parsedPatients = storedPatients ? JSON.parse(storedPatients) : [];
      setPatients(parsedPatients);
    } catch (error) {
      console.error('Erreur lors de la récupération des patients', error);
    }
  };

  
  const calculateWeeksBetween = (start: Date, end: Date) => {
    const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor((end.getTime() - start.getTime()) / millisecondsPerWeek);
  };

  // Récupérer les dates DDR et DPA
  const ddrDate = new Date(patient.ddr);
  const dpaDate = new Date(patient.dpa);
  const today = new Date();

  useEffect(() => {
    if (patient?.ddr) { // Vérifie que patient n'est pas undefined avant d'accéder à ddr
      const ddrDate = new Date(patient.ddr);
      const dpaDate = new Date(ddrDate);
      dpaDate.setDate(ddrDate.getDate() + 280); // Calcul du DPA
  
      setPatient(prevPatient => ({
        ...prevPatient!,
        dpa: dpaDate.toISOString().split('T')[0], // Mise à jour du DPA
      }));
    }
  }, [patient?.ddr]); // Utilisation de patient?.ddr ici pour éviter l'accès à undefined
   // Surveiller patient au lieu de patient?.ddr pour toute mise à jour
  
  // Calculer les semaines de grossesse et le progrès
  const totalWeeks = calculateWeeksBetween(ddrDate, dpaDate); // 40 semaines
  const weeksPassed = calculateWeeksBetween(ddrDate, today); // Semaines écoulées
  const monthsPassed = Math.floor(weeksPassed / 4); // Mois de grossesse

  // Limiter le progrès à 100% pour éviter de dépasser
  const progress = Math.min(weeksPassed / totalWeeks, 1);

  const dismissModalPatientDetails = () => modalPatientDetails.current?.dismiss();
  const dismissModalAntecedents = () => modalAntecedents.current?.dismiss();

  // Vérifier si l'antécédent existe déjà pour ce patient
  useEffect(() => {
    getPatients(); // Charger les patients lorsque la page se charge
  }, []);

  useEffect(() => {
    if (patient) {
      const existingPatient = patients.find((p) => p.telephone === patient.telephone);
      if (existingPatient && existingPatient.antecedent) {
        setAnswers(existingPatient.antecedent); // Précharger les antécédents si déjà présents
        setIsAntecedentAdded(true); // Mettre à jour l'état pour afficher "Voir Antécédent"
      }
    }
  }, [patients, patient]);

  // Gérer les changements dans les cases à cocher
  const handleCheckboxChange = (field: string, value: boolean) => {
    setAnswers((prevState: any) => ({
      ...prevState,
      [field]: value,
    }));
  };

  

  // Gérer les changements dans les champs de texte
  const handleInputChange = (field: string, value: string) => {
    setAnswers((prevState: any) => ({
      ...prevState,
      [field]: value,
    }));
  };

  // Ajouter les antécédents au patient dans AsyncStorage
const addAntecedent = async () => {
    try {
      const updatedPatients = patients.map((p) => {
        if (p.telephone === patient?.telephone) {
          return { ...p, antecedent: answers }; // Associer les antécédents avec le patient
        }
        return p;
      });
  
      await AsyncStorage.setItem('patients', JSON.stringify(updatedPatients)); // Sauvegarder les patients mis à jour
      setPatients(updatedPatients); // Mettre à jour l'état local avec les patients mis à jour
      console.log('Patients mis à jour:', updatedPatients); // Vérifiez que les patients sont bien mis à jour
      alert('Antécédent ajouté avec succès !');
      setIsAntecedentAdded(true); // Marquer l'antécédent comme ajouté
    } catch (error) {
      console.log('Erreur lors de l\'ajout de l\'antécédent', error);
    }
  };

  const handleChange = (e: any, field: string) => {
    setAnswers({
      ...answers,
      [field]: e.detail.checked,
    });
  };
  

  const handleSubmit = async () => {
    await addAntecedent();
    history.push({
      pathname: '/home', // Rediriger vers la page d'accueil après la soumission
    });
  };

  if (!patient) {
    return (
      <IonPage>
        <IonHeader>
        <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1, // Placer l'arrière-plan en dessous du contenu
                background: 'linear-gradient(45deg, #ff6f61, #6a5acd)',
                 // Exemple de fond dégradé
              }}
            ></motion.div>
          <IonToolbar>
       
         
        
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" />
            </IonButtons>
            <IonTitle>Erreur</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <h2>Aucun patiente trouvé!</h2>
          <IonButton expand="full" onClick={() => history.goBack()}>Retour</IonButton>
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
          
          <IonTitle>Détails du Patiente</IonTitle>
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
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
      <IonButton
  expand="block"
  onClick={() => modalPatientDetails.current?.present()}>
  Détails de {patient.nom} {patient.prenom}
</IonButton>
        </motion.div>
        <IonModal ref={modalPatientDetails}>
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
        

              <IonTitle>Détails du Patiente</IonTitle>
              <IonButtons slot="end" >
                <IonButton onClick={dismissModalPatientDetails}><IonIcon icon={closeOutline} /></IonButton>
              </IonButtons>
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
                boxShadow: 'none',
                height: '120vh',
              
         
              }}
            ></motion.div>

           <IonItem>
         
           <IonInput label="Nom :" value= {patient.nom} readonly={true}></IonInput>
            </IonItem>
            <IonItem>
              <IonLabel>Prénom : {patient.prenom} </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Âge : {patient.age}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Marie : {patient.marie}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>CIN : {patient.cin}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Profession : {patient.profession}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Formation Sanitaire : {patient.adresse}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Date du Dernier Accouchement : {patient.date_dernier_accouchement}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Nombre d'Enfants Vivants : {patient.nombre_enfants_vivants}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>DDR : {patient.ddr}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>DPA : {patient.dpa}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>CPN : {patient.cpn}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Prestataire : {patient.prestataire}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Csb : {patient.csb}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Nbcpn : {patient.nbcpn}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>CPN1 : {patient.cpn}</IonLabel>
            </IonItem>
            </IonContent>
         </IonModal>
         <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >

         <IonButton expand="block" onClick={() => modalAntecedents.current?.present()}>
  Antécédents de {patient.nom}
</IonButton>
</motion.div>
<IonModal ref={modalAntecedents}>
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
        
      <IonTitle>Antécédents</IonTitle>
      <IonButtons slot="end">
        <IonButton onClick={dismissModalAntecedents}><IonIcon icon={closeOutline} /></IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
  <IonContent className="ion-padding">
  <IonGrid
  
  >
    <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1, // Placer l'arrière-plan en dessous du contenu
                background: 'linear-gradient(45deg, #ff6f61, #6a5acd)', // Exemple de fond dégradé
                boxShadow: 'none',
                height: '150vh',
              
         
              }}
            ></motion.div>
  {[
    { label: 'Age inférieur à 18 ans', field: 'ageInferieur18Ans' },
    { label: 'Age supérieur à 38 ans', field: 'ageSuperieur38Ans' },
    { label: 'Primipare âgée de plus de 35 ans', field: 'primipareAgeePlus35Ans' },
    { label: 'Parité supérieure à 5', field: 'pariteSuperieure5' },
    { label: 'Dernier accouchement il y a moins de 2 ans', field: 'dernierAccouchementMoins2Ans' },
    { label: 'Bassin rétréci asymétrique', field: 'bassinRetreciAsymetrique' },
    { label: 'TA supérieure à 14/8', field: 'taSup148' },
    { label: 'Diabète', field: 'diabete' },
    { label: 'Dyspnée', field: 'dyspnee' },
    { label: 'Intervention chirurgicale', field: 'intervention' },
    { label: 'Grossesse gemellaire', field: 'grossesseGemellaire' },
    { label: 'Antécédents médicaux', field: 'antecedent' },
    { label: 'Mort-né', field: 'mortNe' },
    { label: 'Fausses couches', field: 'faussesCouches' },
    { label: 'Habitude', field: 'habitude' }
      ].map(({ label, field }, index) => (
        <div key={field}>
           <motion.div 
    key={field} 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    transition={{ duration: 0.5 }}
  >
          <IonRow>
            <IonCol size="6">
              <IonLabel>{label}</IonLabel>
            </IonCol>
            <IonCol size="3">
              <IonCheckbox
                checked={answers[field]}
                
                onIonChange={() => handleCheckboxChange(field, true)}
              />
              <IonLabel> Oui</IonLabel>
            </IonCol>
            <IonCol size="3">
              <IonCheckbox
                checked={!answers[field]}
            
                onIonChange={() => handleCheckboxChange(field, false)}
              />
              <IonLabel> Non</IonLabel>
            </IonCol>
          </IonRow>
          

          {/* Ligne horizontale après chaque entrée sauf la dernière */}
          {index < 15 && <hr style={{ border: '1px solid #ccc', margin: '10px 0' }} />}
          </motion.div>
        </div>
        
      ))}
    </IonGrid>

    <IonButton expand="full" onClick={handleSubmit}>
      {isAntecedentAdded ? 'Mettre à jour les antécédents' : 'Ajouter Antécédent'}
    </IonButton>

  </IonContent>
</IonModal>
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
<IonCard >
      <IonCardHeader>
        <IonCardTitle>Progrès de la Grossesse</IonCardTitle>
      </IonCardHeader>
      <IonCardContent  style={{ background: 'transparent'}}>
        <p><strong>Mois Atteint :</strong> {monthsPassed} mois</p>
        <p><strong>Date Prévue d'Accouchement (DPA) :</strong> {patient.dpa}</p>

        {/* Barre de progression */}
        <IonProgressBar value={progress} color="success"></IonProgressBar>
        <p style={{ textAlign: 'center' }}>{Math.round(progress * 100)}% de la grossesse complétée</p>
      </IonCardContent>
    </IonCard>
   {/* Suivi Prénatal */}
  
      </IonContent>

      
    </IonPage>
  );
};



export default PatientDetails;
