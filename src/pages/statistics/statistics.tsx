import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { calendar, checkmarkCircle, alertCircle } from 'ionicons/icons';
import { addMonths, isBefore } from 'date-fns';

const Statistics: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [patientsPerDay, setPatientsPerDay] = useState<{ [key: string]: number }>({});
  const [appointmentsDonePerDay, setAppointmentsDonePerDay] = useState<{ [key: string]: number }>({});
  const [appointmentsMissedPerDay, setAppointmentsMissedPerDay] = useState<{ [key: string]: number }>({});

  // Fonction pour récupérer les patients
  const getPatients = async () => {
    const storedPatients = await localStorage.getItem('patients'); // Utiliser localStorage ou AsyncStorage
    if (storedPatients) {
      const parsedPatients = JSON.parse(storedPatients);
      setPatients(parsedPatients);
      calculateStatistics(parsedPatients);
    } else {
      setPatients([]);
    }
  };

  // Fonction pour calculer les statistiques
  const calculateStatistics = (patients: any[]) => {
    const patientsCount: { [key: string]: number } = {};
    const appointmentsDoneCount: { [key: string]: number } = {};
    const appointmentsMissedCount: { [key: string]: number } = {};

    patients.forEach((patient) => {
      const dateAjout = new Date(patient.dateAjout).toLocaleDateString(); // Date d'ajout du patient
      const ddr = new Date(patient.ddr); // Date de rendez-vous

      // Compter les patients ajoutés par jour
      patientsCount[dateAjout] = (patientsCount[dateAjout] || 0) + 1;

      // Vérifier si le rendez-vous est effectué ou manqué
      if (ddr) {
        const currentDate = new Date();
        if (isBefore(ddr, currentDate)) {
          appointmentsMissedCount[dateAjout] = (appointmentsMissedCount[dateAjout] || 0) + 1;
        } else if (ddr.toLocaleDateString() === currentDate.toLocaleDateString()) {
          appointmentsDoneCount[dateAjout] = (appointmentsDoneCount[dateAjout] || 0) + 1;
        }
      }
    });

    setPatientsPerDay(patientsCount);
    setAppointmentsDonePerDay(appointmentsDoneCount);
    setAppointmentsMissedPerDay(appointmentsMissedCount);
  };

  useEffect(() => {
    getPatients();
  }, []);

  const renderStatisticsCard = (title: string, data: { [key: string]: number }) => (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>{title}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {Object.keys(data).map((date, index) => (
          <IonItem key={index}>
            <IonLabel>{date}</IonLabel>
            <IonLabel slot="end">{data[date]}</IonLabel>
          </IonItem>
        ))}
      </IonCardContent>
    </IonCard>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Statistics</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {renderStatisticsCard('Patients Added Per Day', patientsPerDay)}
        {renderStatisticsCard('Appointments Done Per Day', appointmentsDonePerDay)}
        {renderStatisticsCard('Appointments Missed Per Day', appointmentsMissedPerDay)}
      </IonContent>
    </IonPage>
  );
};

export default Statistics;
