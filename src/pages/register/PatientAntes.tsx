import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonLabel, IonCheckbox, IonButton, IonInput } from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocationState {
  telephone: string;
}

const PatientAntes: React.FC = () => {
  const [answers, setAnswers] = useState<any>({
    ageInferieur18Ans: false,
    ageSuperieur38Ans: false,
    primipareAgeePlus35Ans: false,
    pariteSuperieure5: false,
    dernierAccouchementMoins2Ans: false,
    bassinRetreciAsymetrique: false,
    taSup148: false,
    diabete: false,
    dyspnee: false,
    intervention: false,
    grossesseGemellaire: false,
    antecedent: false,
    mortNe: false,
    faussesCouches: false,
    habitude: false,
  });

  const [isAntecedentAdded, setIsAntecedentAdded] = useState<boolean>(false);  // État pour savoir si l'antécédent est ajouté
  const location = useLocation<LocationState>();  // Spécifier LocationState
  const { telephone } = location.state || {};  // Récupérer le téléphone du patient passé dans l'état

  const [patients, setPatients] = useState<any[]>([]);

  // Fonction pour récupérer la liste des patients depuis AsyncStorage
  const getPatients = async () => {
    try {
      const storedPatients = await AsyncStorage.getItem('patients');
      if (storedPatients) {
        setPatients(JSON.parse(storedPatients));
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.log('Erreur lors de la récupération des patients', error);
    }
  };

  useEffect(() => {
    getPatients(); // Charger les patients lorsque la page se charge
  }, []);

  // Vérifier si l'antécédent existe déjà pour ce patient
  useEffect(() => {
    const patient = patients.find((p) => p.telephone === telephone);
    if (patient && patient.antecedent) {
      setAnswers(patient.antecedent);  // Précharger les antécédents si déjà présents
      setIsAntecedentAdded(true);  // Mettre à jour l'état pour afficher "Voir Antécédent"
    }
  }, [patients, telephone]);

  const history = useHistory();

  // Gérer les changements dans les cases à cocher
  const handleCheckboxChange = (field: string, value: boolean) => {
    setAnswers((prevState: any) => ({
      ...prevState,
      [field]: value,
    }));
  };

  // Ajouter les antécédents au patient
  const addAntecedent = async () => {
    try {
      const updatedPatients = patients.map((patient) => {
        if (patient.telephone === telephone) {
          return { ...patient, antecedent: answers };  // Associer les antécédents avec le patient
        }
        return patient;
      });

      await AsyncStorage.setItem('patients', JSON.stringify(updatedPatients));  // Sauvegarder les patients mis à jour
      console.log('Patients mis à jour:', updatedPatients);  // Vérifiez que les patients sont bien mis à jour
      alert('Antécédent ajouté avec succès !');
      setIsAntecedentAdded(true);  // Marquer l'antécédent comme ajouté
    } catch (error) {
      console.log('Erreur lors de l\'ajout de l\'antécédent', error);
    }
  };

  // Fonction pour soumettre les données et naviguer
  const handleSubmit = async () => {
    if (isAntecedentAdded) {
      // Si l'antécédent a déjà été ajouté, on redirige pour voir l'antécédent
      history.push('/voir-antecedent', { state: { telephone } });
    } else {
      await addAntecedent(); // Ajouter les antécédents au patient avant de naviguer
      history.push({
        pathname: '/home',  // Exemple de redirection après la soumission du formulaire
        state: { antecedent: answers }  // Passer les antécédents à la page d'accueil
      });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <IonButton fill="clear" slot="start" onClick={() => history.goBack()}>
              Retour
            </IonButton>
            Antécédents du Patient
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h2>Antécédents du Patient</h2>
        <p>Veuillez répondre aux questions suivantes en sélectionnant "Oui" ou "Non".</p>

        {/* Affichage du numéro de téléphone en lecture seule */}
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonLabel>Numéro de téléphone</IonLabel>
              <IonInput
                value={telephone}
                readonly={true}  // Le champ est en lecture seule
                clearInput={false}  // Désactive l'option de vider le champ
              />
            </IonCol>
          </IonRow>
          
          {/* Rendre chaque question dynamiquement */}
          {[{ label: 'Age inférieur à 18 ans', field: 'ageInferieur18Ans' },
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
            { label: 'Habitude', field: 'habitude' }].map(({ label, field }) => (
            <IonRow key={field}>
              <IonCol size="6">
                <IonLabel>{label}</IonLabel>
              </IonCol>
              <IonCol size="3">
                <IonCheckbox
                  checked={answers[field]}
                  onIonChange={() => handleCheckboxChange(field, true)}
                />
                <IonLabel>Oui</IonLabel>
              </IonCol>
              <IonCol size="3">
                <IonCheckbox
                  checked={!answers[field]}
                  onIonChange={() => handleCheckboxChange(field, false)}
                />
                <IonLabel>Non</IonLabel>
              </IonCol>
            </IonRow>
          ))}
        </IonGrid>

        {/* Bouton conditionnel basé sur si l'antécédent est ajouté ou non */}
        <IonButton expand="full" onClick={handleSubmit}>
          {isAntecedentAdded ? 'Voir Antécédent' : 'Ajouter Antécédent'}
        </IonButton>

      </IonContent>
    </IonPage>
  );
};

export default PatientAntes;
