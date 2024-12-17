import React, { useState, useEffect, useRef } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonCard, IonCardHeader, IonCardTitle, IonList, IonToast, IonAlert, IonButtons, IonBackButton, IonRow, IonCol } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Avatar from 'react-avatar';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { motion } from 'framer-motion';
import { storeData, getData, compressData, decompressData } from '../utils/storageUtils'; // Importer les fonctions de compression et de décompression
import imageCompression from 'browser-image-compression';


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
  const [step, setStep] = useState(1);

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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      // Compresser l'image
      const compressedImage = await compressImage(file);
      if (compressedImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPatient(prevPatient => ({
            ...prevPatient,
            rappel: reader.result as string,
          }));
        };
        reader.readAsDataURL(compressedImage);
      }
    }
  };

  const handleTakePhoto = async () => {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        source: CameraSource.Camera, // Utilisation de la caméra
        resultType: CameraResultType.Uri, // Récupération de l'image sous forme de URI
      });
  
      // Vérifier si `photo.webPath` est défini
      const fileUri = photo.webPath;
  
      if (!fileUri) {
        console.error("Aucune URI d'image obtenue");
        return;
      }
  
      // Récupérer l'image depuis l'URI
      const file = await fetch(fileUri)
        .then((response) => response.blob())
        .then((blob) => {
          return new File([blob], 'photo.jpg', { type: 'image/jpeg' });
        });
  
      // Compresser l'image
      const compressedImage = await compressImage(file);
      if (compressedImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPatient(prevPatient => ({
            ...prevPatient,
            rappel: reader.result as string,
          }));
        };
        reader.readAsDataURL(compressedImage);
      }
    } catch (error) {
      console.error("Erreur lors de la prise de la photo:", error);
      setToastMessage('Erreur lors de la prise de photo.');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 1, // Limite à 1 Mo
      maxWidthOrHeight: 800, // Limite de la largeur ou hauteur de l'image
      useWebWorker: true, // Utilisation d'un Web Worker pour la compression
    };
  
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Erreur lors de la compression de l'image:", error);
      return null;
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
      const storedPatients = await getData('patients');
      let patients = storedPatients ? storedPatients : [];
  
      // Ajouter ou mettre à jour le patient
      if (isEdit) {
        const index = patients.findIndex((p: Patient) => p.telephone === patient.telephone);
        if (index !== -1) {
          patients[index] = patient;
        }
      } else {
        patients.push(patient);
      }
  
      await storeData('patients', patients);
      setToastMessage(isEdit ? 'Patient modifié avec succès!' : 'Patient ajouté avec succès!');
      setToastColor('success');
      setShowToast(true);
      setPatient(initialPatient);
      history.push('/home');
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des patients:", error);
      setToastMessage('Une erreur est survenue.');
      setToastColor('danger');
      setShowToast(true);
    }
  };
  
  

  const handleDelete = async () => {
    try {
      let patients = await getData('patients');
      if (patients) {
        patients = patients.filter((p: Patient) => p.telephone !== patient.telephone);
        await storeData('patients', patients);
      }
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
  
  const modal = useRef<HTMLIonModalElement>(null);
  const validateStep = () => {
    switch (step) {
      case 1:
        return (
          patient.telephone &&
          patient.nom &&
          patient.prenom &&
          patient.age &&
          patient.marie &&
          patient.region
        );
      case 2:
        return (
          patient.date_dernier_accouchement &&
          patient.nombre_enfants_vivants &&
          patient.gestite &&
          patient.parite &&
          patient.ddr
        );
      case 3:
        return (
          patient.district_sanitaire &&
          patient.formation_sanitaire &&
          patient.niveau_instruction &&
          patient.profession_femme &&
          patient.profession_mari &&
          patient.adresse &&
          patient.commune
        );
      default:
        return false;
    }
  };
  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    } else {
      alert('Veuillez remplir tous les champs requis.');
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
        <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>{isEdit ? 'Modifier Patient' : 'Ajouter Patient'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{ paddingTop: '50px' }}>
         {/* Contexte Framer Motion pour l'arrière-plan animé */}
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1, // Placer l'arrière-plan en dessous du contenu
                background: 'linear-gradient(45deg, #ff6f61, #6a5acd)', // Exemple de fond dégradé
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
      {step === 1 && (
          <motion.div
          initial={{ opacity: 0 }}  // Opacité initiale à 0
          animate={{ opacity: 1 }}  // Transition vers une opacité de 1 (visible)
          transition={{ duration: 0.5 }}  // Durée de l'animation
          >
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Informations Personnelles</IonCardTitle>
          </IonCardHeader>
          <motion.div
              style={{
                backgroundColor: '', // Arrière-plan transparent (50% d'opacité)
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Exemple de dégradé linéaire
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1, // Placer l'arrière-plan derrière le contenu
                borderRadius: '20px', // Optionnel : pour arrondir les bords du card
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
          <IonList>
      <IonItem>
          <IonItem lines="none" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={patient.rappel}
                name={patient.nom + ' ' + patient.prenom}
                round={true}
                size="60"
                style={{ marginRight: '20px' }}
              />
              <div>
              
                <p style={{ color: 'gray', fontSize: '14px' }}></p>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <IonButton expand="full" onClick={handleTakePhoto} style={{ marginTop: '10px' }}>
                Prendre une Photo
              </IonButton>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarChange} 
                style={{ display: 'none' }} // Cacher l'input de fichier
                id="file-upload"
              />
              <label htmlFor="file-upload" style={{ display: 'block', marginTop: '10px', cursor: 'pointer', color: '#3880ff' }}>
                Ou téléchargez une image
              </label>
            </div>
          </IonItem>

        </IonItem>
      <IonItem>
            <motion.div 
              initial={{ opacity: 0, y: -20 }} // Commence avec une opacité de 0 et une position verticale décalée
              animate={{ opacity: 1, y: 0 }} // Transition vers une opacité de 1 et une position normale
              transition={{ duration: 0.5 }} // Durée de l'animation
            >
        <IonInput
          label="Téléphone"
          label-placement="floating"
            fill="solid"
          placeholder="Entrez le numéro de téléphone"
          value={patient.telephone}
          onIonChange={e => handleInputChange('telephone', e.detail.value!)}
        />
             </motion.div>
      </IonItem>
      <IonItem>
           <motion.div 
              initial={{ opacity: 0, x: -20 }} // Commence avec une opacité de 0 et un décalage horizontal
              animate={{ opacity: 1, x: 0 }} // Transition vers une opacité de 1 et une position normale
              transition={{ duration: 0.5 }}
            >
        <IonInput
          label="Nom"
          label-placement="floating"
          fill="solid"
          placeholder="Entrez le nom"
          value={patient.nom}
          onIonChange={e => handleInputChange('nom', e.detail.value!)}
        />
            </motion.div>
      </IonItem>
      <IonItem>
              <IonInput
                label="Prénom"
                label-placement="floating"
                fill="solid"
                placeholder="Entrez le prénom"
                value={patient.prenom}
                onIonChange={e => handleInputChange('prenom', e.detail.value!)}
              />
            </IonItem>
            <IonItem style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    style={{ flex: 1 }} // Utilise l'espace disponible pour l'élément
  >
    <IonSelect
      label="Âge"
      fill="solid"
      value={patient.age}
      onIonChange={e => handleInputChange('age', e.detail.value!)}
    >
      {Array.from({ length: 100 }, (_, i) => (
        <IonSelectOption key={i} value={i + 1}>
          {i + 1} ans
        </IonSelectOption>
      ))}
    </IonSelect>
  </motion.div>

  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    style={{ flex: 1, textAlign: 'right' }} // Alignement à droite
  >
    <IonSelect
      label="Marié(e)"
      fill="solid"
      value={patient.marie}
      onIonChange={e => handleInputChange('marie', e.detail.value!)}
    >
      <IonSelectOption value="Oui">Oui</IonSelectOption>
      <IonSelectOption value="Non">Non</IonSelectOption>
    </IonSelect>
  </motion.div>
</IonItem>
            <IonItem>
            <motion.div 
        initial={{ opacity: 0, y: 10 }} // Départ avec opacité de 0 et léger décalage vers le bas
        animate={{ opacity: 1, y: 0 }} // Transition vers une opacité de 1 et une position normale
        transition={{ duration: 0.5 }}
      >
        <IonInput
          label="Région"
            label-placement="floating"
            fill="solid"
          placeholder="Entrez la région"
          value={patient.region}
          onIonChange={e => handleInputChange('region', e.detail.value!)}
        />
      </motion.div>
            </IonItem>
          </IonList>
        </IonCard>
        </motion.div>
      )}

        {/* Section: Informations de la Grossesse */}
        {step === 2 && (
           <motion.div
           initial={{ opacity: 0 }}  // Opacité initiale à 0
           animate={{ opacity: 1 }}  // Transition vers une opacité de 1 (visible)
           transition={{ duration: 0.5 }}  // Durée de l'animation
         >
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
        </motion.div>
        )}

        {/* Section: Détails Professionnels et Autres */}
        {step === 3 && (
           <motion.div
           initial={{ opacity: 0 }}  // Opacité initiale à 0
           animate={{ opacity: 1 }}  // Transition vers une opacité de 1 (visible)
           transition={{ duration: 0.5 }}  // Durée de l'animation
         >
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
        </motion.div>
        )}
         <div className="ion-padding">
  <IonRow>
    {/* Bouton Précédent, aligné à gauche */}
    {step > 1 && (
      <IonCol size="6">
        <IonButton expand="block" onClick={prevStep} className="ion-margin-end">
          Précédent
        </IonButton>
      </IonCol>
    )}

    {/* Bouton Suivant ou Ajouter, aligné à droite */}
    <IonCol size="6" className="ion-text-right">
      {step < 3 && (
        <IonButton expand="block" onClick={nextStep}>
          Suivant
        </IonButton>
      )}

      {step === 3 && (
        <IonButton expand="block" onClick={handleSubmit}>
          {isEdit ? 'Modifier' : 'Ajouter'}
        </IonButton>
      )}
    </IonCol>
  </IonRow>

  {/* Bouton Supprimer, si en mode édition */}
  {isEdit && (
    <IonRow>
      <IonCol size="12">
        <IonButton expand="block" color="danger" onClick={() => setShowDeleteAlert(true)}>
          Annuler
        </IonButton>
      </IonCol>
    </IonRow>
  )}
</div>



        
      

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
