import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonItem, IonButton, IonButtons, IonBackButton, IonGrid, IonRow, IonCol } from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Définir l'interface Patient pour garantir que l'objet a la bonne forme
interface Patient {
  telephone: any;
  nom: string;
  prenom: string;
  age: number;
  marie: string;
  region: string;
  district_sanitaire: string;
  formation_sanitaire: string;
  niveau_instruction: string;
  profession_femme: string;
  profession_mari: string;
  adresse: string;
  commune: string;
  date_dernier_accouchement: string;
  nombre_enfants_vivants: number;
  gestite: number;
  parite: number;
  ddr: string;
  dpa: string;
  cpn1: number;
  rappel: string;
  antecedent?: any; // Ajout de la propriété 'antecedent' de type any
}

// Définir un type pour le state de useLocation avec la structure spécifique attendue
interface LocationState {
  patient: Patient;
}

const PatientDetails: React.FC = () => {
  const location = useLocation<LocationState>(); // Utiliser le type LocationState pour `useLocation`
  const history = useHistory();

  // Vérifier si patient est disponible dans le state
  const patient: Patient | undefined = location.state?.patient;

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
  const [showPatientDetails, setShowPatientDetails] = useState<boolean>(false); // État pour contrôler la visibilité des détails du patient
  const [showAntecedents, setShowAntecedents] = useState<boolean>(false); // État pour contrôler la visibilité des antécédents

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
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" />
            </IonButtons>
            <IonTitle>Erreur</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <h2>Aucun patient trouvé!</h2>
          <IonButton expand="full" onClick={() => history.goBack()}>Retour</IonButton>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Détails du Patient</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <button onClick={() => setShowPatientDetails(!showPatientDetails)}>
          <h2>Détails de {patient.nom} {patient.prenom}</h2>
        </button>
        {showPatientDetails && (
          <>
            <IonItem>
              <IonLabel>Nom: {patient.nom}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Prénom: {patient.prenom}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Âge: {patient.age}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Marie: {patient.marie}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Région: {patient.region}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>District Sanitaire: {patient.district_sanitaire}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Formation Sanitaire: {patient.formation_sanitaire}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Niveau d'Instruction: {patient.niveau_instruction}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Profession de la Femme: {patient.profession_femme}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Profession du Mari: {patient.profession_mari}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Adresse: {patient.adresse}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Commune: {patient.commune}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Date du Dernier Accouchement: {patient.date_dernier_accouchement}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Nombre d'Enfants Vivants: {patient.nombre_enfants_vivants}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Gestité: {patient.gestite}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Parité: {patient.parite}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>DDR: {patient.ddr}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>DPA: {patient.dpa}</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>CPN1: {patient.cpn1}</IonLabel>
            </IonItem>
         
          </>
        )}

        <button onClick={() => setShowAntecedents(!showAntecedents)}>
          <h2>Antécédents de {patient.nom}</h2>
        </button>
        {showAntecedents && (
          <>
            <IonGrid>
              <IonRow>
                <IonCol>
                  <IonItem>
                    <IonLabel>Âge inférieur à 18 ans: {answers.ageInferieur18Ans ? 'Oui' : 'Non'}</IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Âge supérieur à 38 ans: {answers.ageSuperieur38Ans ? 'Oui' : 'Non'}</IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Primipare âgée de plus de 35 ans: {answers.primipareAgeePlus35Ans ? 'Oui' : 'Non'}</IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Parité supérieure à 5: {answers.pariteSuperieure5 ? 'Oui' : 'Non'}</IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Dernier accouchement il y a moins de 2 ans: {answers.dernierAccouchementMoins2Ans ? 'Oui' : 'Non'}</IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Bassin rétréci ou asymétrique: {answers.bassinRetreciAsymetrique ? 'Oui' : 'Non'}</IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>TA supérieure à 148/100: {answers.taSup148 ? 'Oui' : 'Non'}</IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Diabète: {answers.diabete ? 'Oui' : 'Non'}</IonLabel>
                  </IonItem>
                </IonCol>
                <IonCol>
                  <IonItem>
                    <IonLabel>Dyspnée: {answers.dyspnee ? 'Oui' : 'Non'}</IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Intervention chirurgicale utérine: {answers.intervention ? 'Oui' : 'Non'}</IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Grossesse gémellaire: {answers.grossesseGemellaire ? 'Oui' : 'Non'}</IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Antécédent de mort-né: {answers.mortNe ? 'Oui' : 'Non'}</IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Antécédent de fausses couches: {answers.faussesCouches ? 'Oui' : 'Non'}</IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Habitude particulière (alcoolisme, tabagisme): {answers.habitude ? 'Oui' : 'Non'}</IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>Autre antécédent: {answers.autreAntecedent}</IonLabel>
                  </IonItem>
                </IonCol>
              </IonRow>
            </IonGrid>
            <IonButton expand="full" onClick={handleSubmit}>
              {isAntecedentAdded ? 'Mettre à jour les antécédents' : 'Ajouter Antécédent'}
            </IonButton>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default PatientDetails;
