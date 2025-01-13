import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonBackButton,
  IonButtons,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonModal,
  IonButton,
  IonCheckbox,
  IonTextarea,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addMonths, format, isSameMonth } from 'date-fns';
import { motion } from 'framer-motion'; 

// Définir le type pour les rendez-vous
interface Appointment {
  date: Date;
  isCompleted: boolean | null;  // Utilise null pour indiquer un état non défini
  notes: string | null;
  rdvEffectue?: boolean; 
}

interface Patient {
  telephone: string;
  nom: string;
  prenom: string;
  ddr: string; // Date de début de la grossesse ou autre
  rappel: string;
  appointments: Appointment[];
  rdvEffectue?: boolean;
}

const Consultations: React.FC = () => {
  const history = useHistory();
  const [patients, setPatients] = useState<Patient[]>([]);  // Typage de patients
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);  // Typage de selectedPatient
  const [showModal, setShowModal] = useState(false);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  


  // Fonction pour récupérer tous les patients depuis AsyncStorage
  const getPatients = async () => {
    try {
      const patientsData = await AsyncStorage.getItem('patients');
      if (patientsData) {
        const parsedPatients: Patient[] = JSON.parse(patientsData);
        console.log('Patients récupérés:', parsedPatients); // Log pour vérifier les patients récupérés
        setPatients(parsedPatients);
      }
    } catch (error) {
      console.error('Erreur de récupération des patients:', error);
    }
  };

  // Fonction de sauvegarde des rendez-vous
const saveRendezVous = async (patient: Patient) => {
  try {
      // Sauvegarde des rendez-vous du patient dans AsyncStorage
      const patientsData = await AsyncStorage.getItem('patients');
      if (patientsData) {
          let patients = JSON.parse(patientsData);

          // Trouver le patient qui a été modifié
          const patientIndex = patients.findIndex((p: Patient) => p.telephone === patient.telephone);
          if (patientIndex !== -1) {
              patients[patientIndex] = patient; // Remplacer le patient existant avec les nouvelles données
          }

          // Enregistrer à nouveau la liste des patients dans AsyncStorage
          await AsyncStorage.setItem('patients', JSON.stringify(patients));
      }
  } catch (error) {
      console.error('Erreur d\'enregistrement des rendez-vous:', error);
  }
};

  
  useEffect(() => {
    getPatients(); // Récupérer les patients au chargement de la page
  }, []);

  const handlePatientClick = (patient: Patient) => {
    // Vérifiez si le patient a des rendez-vous, sinon générez-les
    const patientWithAppointments = {
      ...patient,
      appointments: patient.appointments && patient.appointments.length > 0 ? patient.appointments : generateAppointments(patient.ddr),
    };
  
    // Mise à jour de l'état global rdvEffectue avant d'afficher le modal
    const allAppointmentsCompleted = patientWithAppointments.appointments.every(
      (appointment) => appointment.isCompleted === true
    );
    patientWithAppointments.rdvEffectue = allAppointmentsCompleted;
  
    setSelectedPatient(patientWithAppointments);
    setShowAllAppointments(false); // Réinitialiser l'affichage des rendez-vous supplémentaires
    setShowModal(true);
  };
  
  
  const generateAppointments = (ddr: string): Appointment[] => {
    const appointments: Appointment[] = [];
    const ddrDate = new Date(ddr);
    for (let i = 1; i <= 9; i++) {
      const appointmentDate = addMonths(ddrDate, i);
      appointments.push({ date: appointmentDate, isCompleted: null, notes: null });
    }
    return appointments;
  };

  const handleCheckboxChange = (index: number, isCompleted: boolean) => {
    if (selectedPatient) {
      // Crée une copie des rendez-vous du patient
      const updatedAppointments = [...selectedPatient.appointments];
  
      // Mets à jour le rendez-vous en cours (celui avec l'index)
      updatedAppointments[index].isCompleted = isCompleted;
  
      // Vérifie si le rendez-vous du mois en cours est effectué
      const currentMonthAppointment = updatedAppointments.find((appointment) =>
        isSameMonth(new Date(appointment.date), new Date())
      );
  
      // Mets à jour le rdvEffectue en fonction du rendez-vous du mois en cours
      const updatedPatient = {
        ...selectedPatient,
        appointments: updatedAppointments,
        rdvEffectue: currentMonthAppointment?.isCompleted === true, // Si le rendez-vous du mois est effectué, mettre à jour rdvEffectue
      };
  
      // Mets à jour l'état avec les rendez-vous modifiés et le nouveau statut de rdvEffectue
      setSelectedPatient(updatedPatient);
  
      // Sauvegarde ce changement dans AsyncStorage
      saveRendezVous(updatedPatient);
    }
  };
  
  

  
  
  
  
  
  const checkForNotifications = () => {
    // Implémentez votre logique ici
    console.log('Vérification des notifications...');
  };
  
  

  const handleNotesChange = (index: number, notes: string) => {
    const updatedAppointments = [...selectedPatient!.appointments];
    updatedAppointments[index].notes = notes;
    setSelectedPatient({ ...selectedPatient!, appointments: updatedAppointments });
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPatient(null);
  };

  const saveChanges = async () => {
    if (!selectedPatient) return;
  
    // Vérification des données avant l'enregistrement
    console.log('Données avant enregistrement:', selectedPatient);
  
    // Enregistrer les rendez-vous dans AsyncStorage
    await saveRendezVous(selectedPatient);
  
    // Récupérer à nouveau les patients après enregistrement
    await getPatients(); // Rafraîchir la liste des patients avec les données les plus récentes
  
    // Vérification de l'enregistrement
    const patientsData = await AsyncStorage.getItem('patients');
    console.log('Patients après enregistrement:', JSON.parse(patientsData || '[]'));
  
    closeModal(); // Fermer le modal après enregistrement
  };

 const currentMonthAppointments = (appointments: Appointment[]) => {
  const now = new Date();
  return appointments.filter(appointment => isSameMonth(new Date(appointment.date), now));
};


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Consultations des patientes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
      <IonList>
  {patients.map((patient) => {
    // Générer les initiales à partir du nom et prénom
    const initiales = `${patient.nom?.charAt(0) || ''}${patient.prenom?.charAt(0) || ''}`.toUpperCase();

    return (
      <IonItem key={patient.telephone} button onClick={() => handlePatientClick(patient)}>
        <IonAvatar slot="start">
          {patient.rappel ? (
            // Si une image d'avatar est disponible
            <img src={patient.rappel} alt={`${patient.nom} ${patient.prenom}`} />
          ) : (
            // Sinon, afficher les initiales dans un cercle
            <div
              style={{
                backgroundColor: '#ccc',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '18px',
                height: '100%',
                width: '100%',
                borderRadius: '50%',
              }}
            >
              {initiales}
            </div>
          )}
        </IonAvatar>
        <IonLabel>
          {patient.nom} {patient.prenom}
        </IonLabel>
      </IonItem>
    );
  })}
</IonList>


    {selectedPatient && (
      <IonModal isOpen={showModal} onDidDismiss={closeModal}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Rendez-vous pour {selectedPatient.nom} {selectedPatient.prenom}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={closeModal}>Fermer</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {selectedPatient.appointments && Array.isArray(selectedPatient.appointments) && selectedPatient.appointments.length > 0 ? (
            selectedPatient.appointments
              .filter((rendezVous) => isSameMonth(new Date(rendezVous.date), new Date())) // Rendez-vous du mois en cours
              .map((rendezVous: Appointment, index) => (
                <div key={index}>
                  <IonItem>
                    <IonLabel>{format(rendezVous.date, 'dd/MM/yyyy')}</IonLabel>
                  </IonItem>
                  <IonItem lines="none">
                    <IonLabel position="stacked">Rendez-vous effectué</IonLabel>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <IonCheckbox
                        justify="space-between"
                        style={{ borderRadius: '50%' }}
                        checked={rendezVous.isCompleted === true}
                        onIonChange={() => handleCheckboxChange(index, true)}
                      />
                    </motion.div>
                  </IonItem>
                  <IonItem lines="none">
                    <IonLabel position="stacked">Rendez-vous non effectué</IonLabel>
                    <IonCheckbox
                      checked={rendezVous.isCompleted === null}
                      onIonChange={() => handleCheckboxChange(index, false)}
                    />
                  </IonItem>
                  <IonItem lines="none">
                    <IonLabel position="stacked">Notes</IonLabel>
                    <IonTextarea
                      value={rendezVous.notes || ''}
                      onIonChange={(e) => handleNotesChange(index, e.detail.value!)}
                      placeholder="Ajoutez des notes..."
                      autoGrow
                    />
                  </IonItem>
                </div>
              ))
          ) : (
            <IonItem>
              <IonLabel>Aucun rendez-vous disponible</IonLabel>
            </IonItem>
          )}

          {showAllAppointments && selectedPatient.appointments.map((rendezVous: Appointment, index) => (
            <div key={index}>
              {!isSameMonth(new Date(rendezVous.date), new Date()) && (
                <>
                  <IonItem>
                    <IonLabel>{format(rendezVous.date, 'dd/MM/yyyy')}</IonLabel>
                  </IonItem>
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
                      checked={rendezVous.isCompleted === null}
                      onIonChange={() => handleCheckboxChange(index, false)}
                    />
                  </IonItem>
                  <IonItem lines="none">
                    <IonLabel position="stacked">Notes</IonLabel>
                    <IonTextarea
                      value={rendezVous.notes || ''}
                      onIonChange={(e) => handleNotesChange(index, e.detail.value!)}
                      placeholder="Ajoutez des notes..."
                      autoGrow
                    />
                  </IonItem>
                </>
              )}
            </div>
          ))}

          {/* Bouton Voir plus / Voir moins */}
          <IonButton expand="block" onClick={() => setShowAllAppointments(!showAllAppointments)}>
            {showAllAppointments ? 'Voir moins' : 'Voir plus'}
          </IonButton>

          <IonButton expand="block" onClick={saveChanges}>Enregistrer</IonButton>
        </IonContent>
      </IonModal>
    )}
  </IonContent>
    </IonPage>
  );
};

export default Consultations;
