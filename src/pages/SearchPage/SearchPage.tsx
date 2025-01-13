import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonText,
  IonBackButton,
  IonButtons,
} from '@ionic/react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interface Patient
interface Patient {
  nom: string;
  prenom: string;
  telephone: string;
  rappel?: string;
}

const SearchPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]); // Tous les patients récupérés
  const [searchQuery, setSearchQuery] = useState(''); // Texte de recherche
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]); // Patients affichés (par défaut = tous)

  // Récupération des données des patients depuis AsyncStorage
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const storedPatients = await AsyncStorage.getItem('patients');
        if (storedPatients) {
          const parsedPatients = JSON.parse(storedPatients);
          setPatients(parsedPatients); // Remplir tous les patients
          setFilteredPatients(parsedPatients); // Initialiser les patients affichés avec tous les patients
        } else {
          setPatients([]);
          setFilteredPatients([]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données depuis AsyncStorage:', error);
        setPatients([]);
        setFilteredPatients([]);
      }
    };

    fetchPatients();
  }, []);

  // Gestion des changements dans la barre de recherche
  const handleSearchChange = (e: any) => {
    const query = (e.target as HTMLIonSearchbarElement).value || '';
    setSearchQuery(query); // Mettre à jour la requête de recherche

    // Si la barre est vide, afficher tous les patients
    if (query.trim() === '') {
      setFilteredPatients(patients);
      return;
    }

    // Filtrer les patients selon la recherche
    const filtered = patients.filter((patient) =>
      patient.nom.toLowerCase().includes(query.toLowerCase()) ||
      patient.prenom.toLowerCase().includes(query.toLowerCase()) ||
      patient.telephone.includes(query)
    );
    setFilteredPatients(filtered); // Mettre à jour la liste affichée
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Rechercher un Patient</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* Barre de recherche */}
        <IonSearchbar
          value={searchQuery}
          onIonInput={handleSearchChange}
          debounce={300} // Temps d'attente avant le déclenchement de la recherche
          placeholder="Rechercher par nom, prénom ou numéro"
          showClearButton="focus"
        />

        {/* Liste des patients filtrés */}
        <IonList>
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient, index) => (
              <IonItem key={index}>
                <IonAvatar slot="start">
                  <img
                    src={patient.rappel || 'https://via.placeholder.com/150'}
                    alt={`${patient.nom} ${patient.prenom}`}
                    onError={(e) =>
                      (e.currentTarget.src = 'https://via.placeholder.com/150')
                    }
                  />
                </IonAvatar>
                <IonLabel>
                  <h2>{`${patient.nom} ${patient.prenom}`}</h2>
                  <p>{`Tel: ${patient.telephone}`}</p>
                </IonLabel>
              </IonItem>
            ))
          ) : (
            <IonText color="medium">Aucun résultat trouvé</IonText>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default SearchPage;
