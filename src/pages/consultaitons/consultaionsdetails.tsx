import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonList, IonItem, IonLabel, IonCheckbox, IonTextarea, IonButton } from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { motion } from 'framer-motion';

interface RendezVous {
  id: string;
  date: string;
  isCompleted?: boolean;
  notes: string;
}

interface Patient {
  telephone: string; // Utiliser le numéro de téléphone comme identifiant
  ddr: string; // Date de Dernière Règle
  dpa: string; // Date Prévue d'Accouchement
}

const RendezVousPage: React.FC = () => {
  const { telephone } = useParams<{ telephone: string }>(); // Récupérer le téléphone du patient dans l'URL
  const [rendezVousList, setRendezVousList] = useState<RendezVous[]>([]);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const history = useHistory();

  const fetchPatientData = async (telephone: string) => {
    try {
      const storedPatients = await AsyncStorage.getItem('patients');
      const patients = storedPatients ? JSON.parse(storedPatients) : [];
      const patient = patients.find((p: Patient) => p.telephone === telephone);
      if (patient) {
        setPatientData(patient);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données du patient', error);
    }
  };

  useEffect(() => {
    if (telephone) {
      fetchPatientData(telephone);
    }
  }, [telephone]);

  useEffect(() => {
    if (patientData) {
      const generateRendezVous = () => {
        const ddr = new Date(patientData.ddr);
        const dpa = new Date(patientData.dpa);
        const rendezVous = [];
        let currentRdvDate = new Date(ddr);

        while (currentRdvDate <= dpa) {
          rendezVous.push({
            id: `${currentRdvDate.getTime()}`,
            date: currentRdvDate.toISOString(),
            isCompleted: undefined,
            notes: '',
          });
          currentRdvDate.setMonth(currentRdvDate.getMonth() + 1);
        }

        setRendezVousList(rendezVous);
      };

      generateRendezVous();
    }
  }, [patientData]);

  const handleCheckboxChange = (index: number, completed: boolean | undefined) => {
    const updatedRendezVous = [...rendezVousList];
    updatedRendezVous[index].isCompleted = completed;
    setRendezVousList(updatedRendezVous);
  };

  const handleNotesChange = (index: number, notes: string) => {
    const updatedRendezVous = [...rendezVousList];
    updatedRendezVous[index].notes = notes;
    setRendezVousList(updatedRendezVous);
  };

  const handleSave = () => {
    alert('Modifications enregistrées');
    history.goBack();
  };

  return (
    <IonPage>
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

        {rendezVousList.length === 0 ? (
          <IonLabel>Aucun rendez-vous trouvé pour ce patient avec le numéro de téléphone : {telephone}.</IonLabel>
        ) : (
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

            {rendezVousList.map((rendezVous, index) => (
              <IonItem key={rendezVous.id}>
                
                <IonLabel>
                  
                  <h2>{new Date(rendezVous.date).toLocaleString()}</h2>
                  <IonItem lines="none">
                    <IonLabel position="stacked">Rendez-vous effectué</IonLabel>
                    <IonCheckbox
                      checked={rendezVous.isCompleted === true}
                      onIonChange={() => handleCheckboxChange(index, true)}
                    />
                  </IonItem>
                  <IonItem lines="none">
                    <IonLabel position="stacked">Rendez-vous non effectué</IonLabel>
                    <IonCheckbox
                      checked={rendezVous.isCompleted === false}
                      onIonChange={() => handleCheckboxChange(index, false)}
                    />
                  </IonItem>
                  <IonItem lines="none">
                    <IonLabel position="stacked">Notes</IonLabel>
                    <IonTextarea
                      value={rendezVous.notes}
                      onIonChange={(e) => handleNotesChange(index, e.detail.value!)}
                      placeholder="Ajoutez des notes..."
                      autoGrow
                    />
                  </IonItem>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}
        <IonButton expand="full" onClick={handleSave}>Enregistrer</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default RendezVousPage;
