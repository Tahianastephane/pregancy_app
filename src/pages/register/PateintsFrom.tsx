import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonCard, IonCardHeader, IonCardTitle, IonList, IonToast, IonAlert } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Avatar from 'react-avatar';

interface Patient {
  telephone: string;
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
  ddr: string | undefined;
  dpa: string;
  cpn1: number;
  rappel: string;
}

interface LocationState {
  patient?: Patient;
}

const PatientForm: React.FC = () => {
  const location = useLocation<LocationState>();
  const history = useHistory();

  const initialPatient: Patient = {
    telephone: '',
    nom: '',
    prenom: '',
    age: 0,
    marie: '',
    region: '',
    district_sanitaire: '',
    formation_sanitaire: '',
    niveau_instruction: '',
    profession_femme: '',
    profession_mari: '',
    adresse: '',
    commune: '',
    date_dernier_accouchement: '',
    nombre_enfants_vivants: 0,
    gestite: 0,
    parite: 0,
    ddr: '',
    dpa: '',
    cpn1: 0,
    rappel: ''
  };

  const [patient, setPatient] = useState<Patient>(initialPatient);
  const [isEdit, setIsEdit] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  useEffect(() => {
    if (location.state && location.state.patient) {
      setPatient(location.state.patient);
      setIsEdit(true);
    } else {
      setPatient(initialPatient);
      setIsEdit(false);
    }
  }, [location.state]);

  useEffect(() => {
    if (patient.ddr) {
      const ddrDate = new Date(patient.ddr);
      const dpaDate = new Date(ddrDate);
      dpaDate.setDate(ddrDate.getDate() + 280);
      setPatient(prevPatient => ({ ...prevPatient, dpa: dpaDate.toISOString().split('T')[0] }));
    }
  }, [patient.ddr]);

  const handleInputChange = (field: string, value: any) => {
    setPatient({ ...patient, [field]: value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPatient(prevPatient => ({ ...prevPatient, rappel: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async () => {
    if (
      !patient.telephone || !patient.nom || !patient.prenom || !patient.age || !patient.marie || !patient.region || !patient.district_sanitaire ||
      !patient.formation_sanitaire || !patient.niveau_instruction || !patient.profession_femme || !patient.profession_mari ||
      !patient.adresse || !patient.commune || !patient.date_dernier_accouchement || !patient.nombre_enfants_vivants ||
      !patient.gestite || !patient.parite || !patient.ddr || !patient.dpa || !patient.cpn1 || !patient.rappel
    ) {
      setToastMessage('Tous les champs doivent être remplis.');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    try {
      const storedPatients = await AsyncStorage.getItem('patients');
      let patients = storedPatients ? JSON.parse(storedPatients) : [];

      if (isEdit) {
        const index = patients.findIndex((p: Patient) => p.telephone === patient.telephone);
        if (index !== -1) {
          patients[index] = patient;
        }
      } else {
        patients.push(patient);
      }

      await AsyncStorage.setItem('patients', JSON.stringify(patients));
      setToastMessage(isEdit ? 'Patient modifié avec succès!' : 'Patient ajouté avec succès!');
      setToastColor('success');
      setShowToast(true);
      setPatient(initialPatient);
      history.push('/home');
    } catch (error) {
      console.error("Error saving patient:", error);
      setToastMessage('Une erreur est survenue.');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const handleCancel = () => {
    setToastMessage('Annulation réussie!');
    setToastColor('success');
    setShowToast(true);
    setPatient(initialPatient);  // Réinitialiser le patient
    setIsEdit(false);            // Réinitialiser le mode édition
    history.push('/home');
  };

  const handleDelete = async () => {
    try {
      const storedPatients = await AsyncStorage.getItem('patients');
      let patients = storedPatients ? JSON.parse(storedPatients) : [];

      patients = patients.filter((p: Patient) => p.telephone !== patient.telephone);

      await AsyncStorage.setItem('patients', JSON.stringify(patients));
      setToastMessage('Patient supprimé avec succès!');
      setToastColor('success');
      setShowToast(true);
      setShowDeleteAlert(false);
      history.push('/home');
    } catch (error) {
      console.error("Error deleting patient:", error);
      setToastMessage('Une erreur est survenue.');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{isEdit ? 'Modifier Patient' : 'Ajouter Patient'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Informations Personnelles</IonCardTitle>
          </IonCardHeader>
          <IonList>
          <IonItem>
              <Avatar
                src={patient.rappel}
                name={patient.nom + ' ' + patient.prenom}
                round={true}
                size="100"
              />
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
            </IonItem>
            <IonItem>
              <IonInput
                label="Téléphone"
                placeholder="Entrez le numéro de téléphone"
                value={patient.telephone}
                onIonChange={e => handleInputChange('telephone', e.detail.value!)}
              />
           </IonItem>
           <IonItem>
              <IonInput
                label="Nom"
                placeholder="Entrez le nom"
                value={patient.nom}
                onIonChange={e => handleInputChange('nom', e.detail.value!)}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Prénom"
                placeholder="Entrez le prénom"
                value={patient.prenom}
                onIonChange={e => handleInputChange('prenom', e.detail.value!)}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Âge"
                type="number"
                placeholder="Entrez l'âge"
                value={patient.age.toString()}
                onIonChange={e => handleInputChange('age', parseInt(e.detail.value!, 10))}
              />
            </IonItem>
            <IonItem>
              <IonSelect
                label="Marié(e)"
                value={patient.marie}
                onIonChange={e => handleInputChange('marie', e.detail.value!)}
              >
                <IonSelectOption value="Oui">Oui</IonSelectOption>
                <IonSelectOption value="Non">Non</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonInput
                label="Région"
                placeholder="Entrez la région"
                value={patient.region}
                onIonChange={e => handleInputChange('region', e.detail.value!)}
              />
            </IonItem>
          </IonList>
        </IonCard>

        {/* Section: Informations de la Grossesse */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Informations de la Grossesse</IonCardTitle>
          </IonCardHeader>
          <IonList>
          <IonItem>
              <IonInput
                label="Date Dernier Accouchement"
                type="date"
                value={patient.date_dernier_accouchement}
                onIonChange={e => handleInputChange('date_dernier_accouchement', e.detail.value!)}
                placeholder="YYYY-MM-DD" // Affichage du placeholder au format requis
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Nombre d'Enfants Vivants"
                type="number"
                value={patient.nombre_enfants_vivants.toString()}
                onIonChange={e => handleInputChange('nombre_enfants_vivants', parseInt(e.detail.value!, 10))}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Gestité"
                type="number"
                value={patient.gestite.toString()}
                onIonChange={e => handleInputChange('gestite', parseInt(e.detail.value!, 10))}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Parité"
                type="number"
                value={patient.parite.toString()}
                onIonChange={e => handleInputChange('parite', parseInt(e.detail.value!, 10))}
              />
            </IonItem>
            
            <IonItem>
              <IonInput
                label="DDR"
                type="date"
                value={patient.ddr}
                onIonChange={e => handleInputChange('ddr', e.detail.value!)}
                placeholder="YYYY-MM-DD" // Affichage du placeholder au format requis
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Date Prévue d'Accouchement (DPA)"
                type="date"
                value={patient.dpa}
                readonly
              />
            </IonItem>
            
            <IonItem>
              <IonInput
                label="CPN1"
                type="number"
                value={patient.cpn1.toString()}
                onIonChange={e => handleInputChange('cpn1', parseInt(e.detail.value!, 10))}
              />
            </IonItem>
          </IonList>
        </IonCard>

        {/* Section: Détails Professionnels et Autres */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Détails Professionnels et Autres</IonCardTitle>
          </IonCardHeader>
          <IonList>
            <IonItem>
              <IonInput
                label="District Sanitaire"
                placeholder="Entrez le district sanitaire"
                value={patient.district_sanitaire}
                onIonChange={e => handleInputChange('district_sanitaire', e.detail.value!)}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Formation Sanitaire"
                placeholder="Entrez la formation sanitaire"
                value={patient.formation_sanitaire}
                onIonChange={e => handleInputChange('formation_sanitaire', e.detail.value!)}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Niveau Instruction"
                placeholder="Entrez le niveau d'instruction"
                value={patient.niveau_instruction}
                onIonChange={e => handleInputChange('niveau_instruction', e.detail.value!)}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Profession de la Femme"
                placeholder="Entrez la profession de la femme"
                value={patient.profession_femme}
                onIonChange={e => handleInputChange('profession_femme', e.detail.value!)}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Profession du Mari"
                placeholder="Entrez la profession du mari"
                value={patient.profession_mari}
                onIonChange={e => handleInputChange('profession_mari', e.detail.value!)}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Adresse"
                placeholder="Entrez l'adresse"
                value={patient.adresse}
                onIonChange={e => handleInputChange('adresse', e.detail.value!)}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Commune"
                placeholder="Entrez la commune"
                value={patient.commune}
                onIonChange={e => handleInputChange('commune', e.detail.value!)}
              />
            </IonItem>
            
          </IonList>
        </IonCard>

        <IonButton expand="full" onClick={handleSubmit}>
          {isEdit ? 'Modifier' : 'Ajouter'}
        </IonButton>
        {isEdit && (
          <IonButton expand="full" color="danger" onClick={() => setShowDeleteAlert(true)}>
            Supprimer
          </IonButton>
        )}
        <IonButton expand="full" onClick={handleCancel}>
          Annuler
        </IonButton>

        <IonToast
          isOpen={showToast}
          message={toastMessage}
          color={toastColor}
          duration={3000}
          onDidDismiss={() => setShowToast(false)}
        />
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Confirmer la suppression"
          message="Voulez-vous vraiment supprimer ce patient?"
          buttons={[
            {
              text: 'Annuler',
              role: 'cancel',
            },
            {
              text: 'Supprimer',
              handler: handleDelete,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default PatientForm;
