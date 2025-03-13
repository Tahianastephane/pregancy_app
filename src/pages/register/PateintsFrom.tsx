import React, { useState, useEffect, useRef } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonCard, IonCardHeader, IonCardTitle, IonList, IonToast, IonAlert, IonButtons, IonBackButton, IonRow, IonCol, IonIcon } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Avatar from 'react-avatar';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { motion } from 'framer-motion';
import { storeData, getData, compressData, decompressData } from '../utils/storageUtils'; // Importer les fonctions de compression et de décompression
import imageCompression from 'browser-image-compression';
import { arrowDown, arrowUp } from 'ionicons/icons';
import '../register/variables.css';


interface Patient {
  telephone: string;
  nom: string;
  prenom: string;
  age: number;
  marie: string;
  profession : string,
  adresse: string;
  date_dernier_accouchement: string;
  nombre_enfants_vivants: number;
  ddr: string ;
  dpa: string;
  cin: string;
  cpn: string,
  prestataire: string,
  csb: string,
  nbcpn: number,
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
    cin: '',
    adresse: '',
    profession:'',
    date_dernier_accouchement: '',
    nombre_enfants_vivants: 0,
    ddr: '',
    dpa: '',
    nbcpn: 0,
    csb:'',
    cpn:'',
    prestataire: '',
    rappel: '',
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
    if (patient?.ddr) { // Vérifiez si patient et ddr sont définis
      const ddrDate = new Date(patient.ddr);
      const dpaDate = new Date(ddrDate);
      dpaDate.setDate(ddrDate.getDate() + 280); // Calcul DPA
  
      setPatient(prevPatient => ({
        ...prevPatient,
        dpa: dpaDate.toISOString().split('T')[0], // Format DPA
      }));
    }
  }, [patient?.ddr]);
  

  const addPatient = async (patient: any) => {
    try {
      // Obtenir les patients existants
      const existingPatients = await AsyncStorage.getItem('patients') || '[]';
      const patients = JSON.parse(existingPatients);
      
      // Ajouter le nouveau patient
      patients.push(patient);
      
      // Compresser et stocker les patients
      const compressedData = JSON.stringify(patients); // Vous pouvez ici compresser les données si nécessaire
      await AsyncStorage.setItem('patients', compressedData);
      
      console.log('Patient ajouté et données stockées.');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du patient:', error);
    }
  };

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
      !patient.telephone || !patient.nom || !patient.prenom || !patient.age || !patient.marie ||  !patient.profession || !patient.cin ||
      !patient.adresse ||  !patient.date_dernier_accouchement  || !patient.ddr || !patient.dpa 
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

  
  // Fonction pour mettre à jour un patient existant
const updatePatient = async (updatedPatient: any) => {
  const patients = await AsyncStorage.getItem('patients');
  const parsedPatients = patients ? JSON.parse(patients) : [];
  const index = parsedPatients.findIndex((p: any) => p.telephone === updatedPatient.telephone);
  
  if (index !== -1) {
    parsedPatients[index] = updatedPatient;
    await AsyncStorage.setItem('patients', JSON.stringify(parsedPatients));
  } else {
    throw new Error("Patient not found");
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
          patient.cin &&
          patient.adresse &&
          patient.profession // Ajoutez la virgule ici
        );
      case 2:
        return (
          patient.date_dernier_accouchement &&
          patient.ddr &&
          patient.dpa // Correction de la casse ici : `patient.dpa`
        );
      default:
        return false;
    }
  };
  
  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    } else {
      alert('Veuillez remplir tous les champs requis .');
    }
  };
  
  const prevStep = () => {
    setStep(step - 1);
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
          <IonTitle>{isEdit ? 'Modifier Patient' : 'Ajouter Patient'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding" style={{ paddingTop: '100px' }}>
         {/* Contexte Framer Motion pour l'arrière-plan animé */}
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1, // Placer l'arrière-plan en dessous du contenu
                background: 'linear-gradient(45deg, #ff6f61, #6a5acd)', 
                height: '109vh',// Exemple de fond dégradé
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
            ></motion.div>
          <IonCardHeader>
            <IonCardTitle>Informations Personnelles</IonCardTitle>
          </IonCardHeader>
        
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
              <label htmlFor="file-upload" style={{ display: 'block', marginTop: '10px', cursor: 'pointer', color: '#000000' }}>
                Ou téléchargez une image
              </label>
            </div>
          </IonItem>

        </IonItem>
      <IonItem
      >
        
            <motion.div 
            style={{
              marginBottom: '0px',
              background: 'transparent',
              borderRadius: 'none',
              padding: '0px',
              
              
            }}
              initial={{ opacity: 0, y: -20 }} // Commence avec une opacité de 0 et une position verticale décalée
              animate={{ opacity: 1, y: 0 }} // Transition vers une opacité de 1 et une position normale
              transition={{ duration: 0.5 }} // Durée de l'animation
            >
        <IonInput
          label="Téléphone"
          label-placement="floating"
           
            type="tel"
            clearInput={true}
            maxlength={10} // Limite la longueur à 10
            required
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
          clearInput={true}
          label-placement="floating"
         
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
                
                clearInput={true}
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
                
                value={patient.age}
                onIonChange={e => handleInputChange('age', e.detail.value!)}
              >
                {Array.from({ length: 100 }, (_, i) => (
                  <IonSelectOption key={i} value={i + 1}>
                    {i + 1} ans
                  </IonSelectOption>
                ))}
              </IonSelect>
            </motion.div><motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ flex: 1, textAlign: 'right' }} ><IonSelect
                label="Marié(e)"
                
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
              initial={{ opacity: 0, x: -20 }} // Commence avec une opacité de 0 et un décalage horizontal
              animate={{ opacity: 1, x: 0 }} // Transition vers une opacité de 1 et une position normale
              transition={{ duration: 0.5 }}
            >
              <IonInput
              label-placement="floating"
                
                label="CIN"
                clearInput={true}
                placeholder="Entrez le numero du CIN"
                value={patient.cin}
                maxlength={12}
                onIonChange={e => handleInputChange('cin', e.detail.value!)}
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
              label-placement="floating"
                
                label="Adresse"
                clearInput={true}
                placeholder="Entrez l'adresse"
                value={patient.adresse}
                onIonChange={e => handleInputChange('adresse', e.detail.value!)}
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
              label-placement="floating"
                
                label="Profession"
                clearInput={true}
                placeholder="Entrez le profession"
                value={patient.profession}
                onIonChange={e => handleInputChange('profession', e.detail.value!)}
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
            ></motion.div>
        
          
          <IonCardHeader >
            <IonCardTitle>Informations de la Grossesse</IonCardTitle>
          </IonCardHeader>
          <IonList>
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
        
          <IonItem >
              <IonInput
                label="Date Dernier Accouchement"
                type="date"
                clearInput={true}
                value={patient.date_dernier_accouchement}
                required
                labelPlacement="floating"
                
                onIonChange={e => handleInputChange('date_dernier_accouchement', e.detail.value!)}
                placeholder="YYYY-MM-DD" // Affichage du placeholder au format requis
              />
            </IonItem>
            
           
  {/* Input à gauche */}
  <IonItem  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  {/* Select pour Nbcpn */}
  <IonSelect
    label="Nbr CPN"
    placeholder="Sélectionnez"
    interface="popover"
    value={patient.nbcpn}
    onIonChange={e => handleInputChange('nbcpn', e.detail.value)}
    style={{ flex: 1, marginRight: '8px' }}
  >
    {Array.from({ length: 5 }, (_, i) => (
      <IonSelectOption key={i} value={i}>
        {i}
      </IonSelectOption>
    ))}
  </IonSelect>

  {/* Select pour Nombre d'Enfants Vivants */}
  <IonSelect
    label="Nbr d'enfant"
    placeholder="Sélectionnez"
    interface="popover"
    value={patient.nombre_enfants_vivants}
    onIonChange={e => handleInputChange('nombre_enfants_vivants', e.detail.value)}
    style={{ flex: 1, marginLeft: '8px' }}
  >
    {Array.from({ length: 14 }, (_, i) => (
      <IonSelectOption key={i} value={i}>
        {i}
      </IonSelectOption>
    ))}
  </IonSelect>
</IonItem>
            
            
        
            <IonItem>
              <IonInput
                label="DDR"
                clearInput={true}
                type="date"
                required
                labelPlacement="floating"
                 
                value={patient.ddr}
                onIonChange={e => handleInputChange('ddr', e.detail.value!)}
                placeholder="YYYY-MM-DD" // Affichage du placeholder au format requis
              />
            </IonItem>
            <IonItem>
            <motion.div 
              initial={{ opacity: 0, x: -20 }} // Commence avec une opacité de 0 et un décalage horizontal
              animate={{ opacity: 1, x: 0 }} // Transition vers une opacité de 1 et une position normale
              transition={{ duration: 0.5 }}
            >
              <IonInput
              label-placement="floating"
                
                label="Prestataire"
                clearInput={true}
                placeholder="Entrez l'adresse"
                value={patient.prestataire}
                onIonChange={e => handleInputChange('prestataire', e.detail.value!)}
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
              label-placement="floating"
                
                label="Lieu des CPN"
                clearInput={true}
                placeholder="Entrez le lieu du CPN"
                value={patient.cpn}
                onIonChange={e => handleInputChange('cpn', e.detail.value!)}
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
              label-placement="floating"
                
                label="Lieu du CSB"
                clearInput={true}
                placeholder="Entrez le lieu du CSB"
                value={patient.csb}
                onIonChange={e => handleInputChange('csb', e.detail.value!)}
              />
              </motion.div>
            </IonItem>
            
            
      </IonList>
        </IonCard>
        </motion.div>
        )}

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
      
      {step < 2 && (
        <IonButton expand="block" onClick={nextStep}>


          Suivant
        </IonButton>
      )}

      {step === 2 && (
       <IonButton expand="full" onClick={handleSubmit}>
       {isEdit ? 'Modifier' : 'Ajouter'}
     </IonButton>
      )}
    </IonCol>
  </IonRow>

         
 
  
 


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
}

export default PatientForm;
