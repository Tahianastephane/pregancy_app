import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonItem,
  IonInput,
  IonText,
  IonIcon,
  IonToast,
  IonRefresher,
  IonRefresherContent,
  IonAvatar,
  IonImg,
  IonCol,
  IonGrid,
  IonRow,
  IonModal,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonBackButton,
  IonButtons,
  IonSpinner,
} from '@ionic/react';
import { closeOutline, eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { getAdmin, getSoignantByMatricule, saveSoignant } from '../database/database';
import bcrypt from 'bcryptjs';
import { IonLoading } from '@ionic/react';
import { motion } from 'framer-motion';
import { useAuth } from '../Authenf/AuthContext';
import logo from '../images/logo.jpeg';
import flag from '../images/flag1.png'
import infi from '../images/infi1.jpeg'
// import '../styles/styles.css'

type Soignant = {
  nom : string,
  prenom : string,
  contact : string,
  matricule: string;
  cin: string;
  region: 
    | 'Alaotra Mangory'
    | 'Analamanga'
    | 'Androy'
    | 'Anosy'
    | 'Atsimo Andrefana'
    | 'Atsimo Antsinana'
    | 'Atsinana'
    | 'Bestiboka'
    | 'boeny'
    | 'Bongolava'
    | 'Diana'
    | 'Fitovinany'
    | 'haute Matsiatra'
    | 'Ihorombe'
    | 'Itasy'
    | 'Melaky'
    | 'Menabe'
    | 'Sava'
    | 'Sofia'
    | 'Vakinankaratra'
    | 'Vatovavy'

  district: string;
  commune: string;
};


const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const history = useHistory();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cin, setCin] = useState<string>('');
  const [nom, setNom] = useState<string>('');
  const [prenom, setPrenom] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [matricule, setMatricule] = useState<string>('');
  const [commune, setCommune] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { login } = useAuth();
  const [bgColor, setBgColor] = useState<string>('#f0f0f0'); // Couleur initiale
  const [region, setRegion] = useState<
   "Alaotra Mangory" | "Analamanga" | "Analanjirofo" | "Androy" | "Anosy" | "Atsimo Andrefana" | "Atsimo Antsinana" | "Antsinana" | "Betsiboka" | "Bongolava" | "Boeny" | "Diana" | "Fitovinany" | "Haute Matsiatra" | "Ihorombe" | "Itasy" | "Melaky" | "Menabe" | "Sava" | "Sofia" | "Vakinankaratra" | "Vatovavy"
>();

const [district, setDistrict] = useState<string | undefined>(undefined);

  const handleLogin = async () => {
    // Vérification que tous les champs sont remplis
    if (!username || !password || !matricule) {
      setErrorMessage('Veuillez remplir tous les champs');
      setShowToast(true);
      return;
    }
  
    if (isLoading) return;
  
    setIsLoading(true);
  
    try {
      // Vérification du matricule dans la base des soignants
      const soignant = await getSoignantByMatricule(matricule);
  
      // Si aucun soignant n'est trouvé, afficher un message d'erreur clair
      if (!soignant) {
        setErrorMessage('Matricule introuvable dans les données des soignants');
        setShowToast(true);
        setIsLoading(false);  // Arrêt du chargement
        return; // On arrête l'exécution si le matricule est introuvable
      }
  
      // Vérification des informations de l'administrateur
      const admin = await getAdmin();
  
      if (admin && admin.length > 0) {
        const storedAdmin = admin[0];
  
        if (typeof storedAdmin.password !== 'string' || !storedAdmin.password) {
          throw new Error("Le mot de passe de l'administrateur est invalide");
        }
  
        const passwordMatch = bcrypt.compareSync(password, storedAdmin.password);
  
        if (username === storedAdmin.username && passwordMatch) {
          const soignant = await getSoignantByMatricule(matricule);
          
          setTimeout(() => {
            setIsLoading(false);
            setBgColor('#4caf50'); // Change la couleur en vert pour indiquer le succès
            login();
            setTimeout(() => history.push('/home'), 1000);
          }, 1000);
        } else {
          throw new Error("Nom d'utilisateur ou mot de passe incorrect");
        }
      } else {
        throw new Error('Aucun administrateur trouvé');
      }
    } catch (error: any) {
      setErrorMessage(error.message);
      setBgColor('#f44336'); // Change la couleur en rouge pour indiquer une erreur
      setShowToast(true);
      setIsLoading(false);
    }
  };
  
  const handleRefresh = (event: CustomEvent) => {
    setUsername('');
    setPassword('');
    setMatricule('');
    setErrorMessage('');
    setShowPassword(false);
    event.detail.complete();
  };

  const handleIdentification = async () => {
    if (!cin || !matricule || !region || !district || !commune) {
      setErrorMessage('Veuillez remplir tous les champs du formulaire d\'identification');
      setShowToast(true);
      return;
    }

    try {
      // Vérifier si le matricule existe déjà
      const existingSoignant = await getSoignantByMatricule(matricule);

      if (existingSoignant) {
        setErrorMessage('Le matricule existe déjà. Veuillez utiliser un autre matricule.');
        setShowToast(true);
        return;
      }

      // Créer un nouvel objet Soignant
      const newSoignant: Soignant = {
        nom,
        prenom,
        contact,
        matricule,
        cin,
        region,
        district,
        commune,
       
      };

      // Enregistrer le soignant
      await saveSoignant(newSoignant);
      setErrorMessage('');
      setShowToast(true);
      setIsModalOpen(false);
      resetFields();
      setIsModalOpen(false); // Fermer la modale

      
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du soignant :', error);
      setErrorMessage('Une erreur est survenue lors de l\'enregistrement.');
      setShowToast(true);
    }
  };


  const handleCloseModal = () => {
    setIsModalOpen(false); // Fermer la modale
    resetFields(); // Réinitialiser les champs
  };

  const resetFields = () => {
    setNom('');
    setPrenom('');
    setContact('');
    setCin('');
    setMatricule('');
    setRegion('');
    setDistrict('');
    setCommune('');
  };
  const regionsWithDistrictsAndCommunes = {
    "Alaotra Mangory": {
      Ambatondrazaka: [
        "CSB2 Antanifotsy",
        "CSB2 Ambohimasina",
        "CSB2 Mangalaza",

      ],
      Andilamena: [
        "CSB2 Andilamena DU",
        "CSB1 Makoeny",
       
      ],
      Amparafaravola: [
        "CSB1 Amparihivola",
        "CSB1 Ambodiaviavy",
        "CSB2 Manakambahiny Kely",
        "CSB2 Amboarabe",

      ],
      Moramang : [
        "CSB2 Andaingo",
        "CSB2 Amboasary Gare",
        "CSB2 Morarano Chrome",
        "CSB2 Sabotsy Anjiro",
      ],
      AnosibenAla : [
        "CSB2 Anosibe Ifody",
        "CSB2 Mandialaza",
        "CSB2 Ampandroantraka",
        "CSB2 Tsaravinany",
      ],
      
      Ambohitralanana: [
        "CSB2 Ambohimiadana",
        "CSB2 Ambatoharanana",
        "CSB2 Longozabe",
        "CSB2 Niarovana",
      ],
      
      Fandriana: [
        "CSB2 Ivongo",
        "CSB2 Ambatomarina",
        "CSB2 Mahaditra",
        "CSB2 Ambohimiarina",
      ],
      
      Ambatofinadrahana: [
        "CSB2 Tsarasaotra",
        "CSB2 Ambatomainty",
        "CSB2 Ivato",
        "CSB2 Ambalavelona",
      ],
      
      Manandriana: [
        "CSB2 Soanierana",
        "CSB2 Ambatoharanana",
        "CSB2 Antanifotsy",
        "CSB2 Ambohitseheno",
      ],
      
    },
    "Analamanga": {
      Antananarivo: [
        "CSB2 Analakely",
        "CSB2 Ambohimanarina",
        "CSB2 Anosy",
        "CSB2 67ha Nord Ouest",
      ],
      
      Ankazobe: [
        "CSB2 Ankazobe Centre",
        "CSB2 Ambodimanga",
        "CSB2 Fiadanana",
        "CSB2 Antsahabe",
      ],
      
      Anjozorobe: [
        "CSB2 Anjozorobe Centre",
        "CSB2 Ambatomanoina",
        "CSB2 Tsarasaotra",
        "CSB2 Manandriana",
      ],
      
      Ambohidratsimo: [
        "CSB2 Ambohitromby",
        "CSB2 Mahitsy",
        "CSB2 Antanetibe",
        "CSB2 Ambohitrimanjaka",
      ],
      
      Manjakandriana: [
        "CSB2 Manjakandriana Ville",
        "CSB2 Ambatomanga",
        "CSB2 Anjeva Gara",
        "CSB2 Ambanitsena",
      ],
      
      AntananarivoAvaradrano: [
        "CSB2 Antanandrano",
        "CSB2 Ivandry",
        "CSB2 Ankadikely Ilafy",
        "CSB2 Ambatolampy",
      ],
      
      AntananarivoAtsimondrano: [
        "CSB2 Itaosy",
        "CSB2 Ambohijanaka",
        "CSB2 Tanjombato",
        "CSB2 Fenoarivo",
      ],
      
      Andramasina: [
        "CSB2 Andramasina Centre",
        "CSB2 Ambatofotsy",
        "CSB2 Anosibe",
        "CSB2 Ambohimanoa",
      ],
      

      
      
    },
      "Analanjirofo": {
        FenoarivoAntsinana: [
          "CSB2 Ampasimadinika",
          "CSB2 Fenoarivo Centre",
          "CSB2 Ambatolampy",
          "CSB2 Vohilengo",
        ],
        
        Maroantsetra: [
          "CSB2 Maroantsetra Centre",
          "CSB2 Ambinanitelo",
          "CSB2 Anandrivola",
          "CSB2 Antakotako",
        ],
        
        MananaraAvaratra: [
          "CSB2 Mananara Centre",
          "CSB2 Antanambe",
          "CSB2 Sahabe",
          "CSB2 Antsahanoro",
        ],
        
        SoaneranaIvongo: [
          "CSB2 Soanerana Centre",
          "CSB2 Ambahoabe",
          "CSB2 Ampasimazava",
          "CSB2 Andaparaty",
        ],
        
        NosyBoaraha: [
          "CSB2 Nosy Be Centre",
          "CSB2 Hell Ville",
          "CSB2 Ambatoloaka",
          "CSB2 Ambondrona",
        ],
        
        Vavatenina: [
          "CSB2 Vavatenina Centre",
          "CSB2 Ambohitrarivo",
          "CSB2 Antsahabe",
          "CSB2 Ambodimandresy",
        ],
        
      },
      "Androy" : {
        AmbovombeAndroy: [
          "CSB2 Ambovombe Centre",
          "CSB2 Marovato",
          "CSB2 Ambazoa",
          "CSB2 Tranomaro",
        ],
        
        Bekily: [
          "CSB2 Bekily Centre",
          "CSB2 Ampamata",
          "CSB2 Tanandava",
          "CSB2 Andranomena",
        ],
        
        BelohaAndroy: [
          "CSB2 Beloha Centre",
          "CSB2 Amboasary",
          "CSB2 Ankilikira",
          "CSB2 Marotsiraka",
        ],
        
        Tsihombe: [
          "CSB2 Tsyhombe Centre",
          "CSB2 Ampanihy",
          "CSB2 Behazomanga",
          "CSB2 Ambatoroka",
        ],
      },
      "Anosy" : {
        Taolagnaro: [
          "CSB2 Taolagnaro Centre",
          "CSB2 Ambovombe",
          "CSB2 Andovoka",
          "CSB2 Maroala",
        ],
        
        Betroka: [
          "CSB2 Betroka Centre",
          "CSB2 Ambohimanarivo",
          "CSB2 Sakaraha",
          "CSB2 Betroka Sud",
        ],
        
        AmboasarySud: [
          "CSB2 Amboasary Centre",
          "CSB2 Ambohiboatavo",
          "CSB2 Ambatoavo",
          "CSB2 Mahabo",
        ],
        
        Ihosy: [
          "CSB2 Ihosy Centre",
          "CSB2 Beravina",
          "CSB2 Ikalamavony",
          "CSB2 Tsivory",
        ],
      },
      
     " AtsimoAndrefana ": {
        ToliaraI: [
          "CSB2 Toliara I Centre",
          "CSB2 Ankilimalinike",
          "CSB2 Andranovory",
          "CSB2 Morondava",
        ],
      
        ToliaraII: [
          "CSB2 Toliara II Centre",
          "CSB2 Tsaramasoandro",
          "CSB2 Manja",
          "CSB2 Antalaha",
        ],
      
        Beroroha: [
          "CSB2 Beroroha Centre",
          "CSB2 Marovato",
          "CSB2 Ambinanibe",
          "CSB2 Tsiry",
        ],
      
        Morombe: [
          "CSB2 Morombe Centre",
          "CSB2 Madirovalo",
          "CSB2 Ankilifilao",
          "CSB2 Andranovory",
        ],
      
        EnkazoaboAtsio: [
          "CSB2 Enkazoabo Centre",
          "CSB2 Ampanihy",
          "CSB2 Soanierana",
          "CSB2 Mahabo",
        ],
      
        Sakara: [
          "CSB2 Sakara Centre",
          "CSB2 Bemaraha",
          "CSB2 Andranomavo",
          "CSB2 Ivohibe",
        ],
      
        Benenitra: [
          "CSB2 Benenitra Centre",
          "CSB2 Beandroka",
          "CSB2 Morarano",
          "CSB2 Ambinanibe",
        ],
      
        BetiokaAtsimo: [
          "CSB2 Betioka Atsimo Centre",
          "CSB2 Soanierana",
          "CSB2 Manja",
          "CSB2 Sakaraha",
        ],
      
        AmpanihyOuest: [
          "CSB2 Ampanihy Ouest Centre",
          "CSB2 Antanimena",
          "CSB2 Tsiliva",
          "CSB2 Bevaotra",
        ],
      },
      " Atsimo Antsinana ": {
        Farafangana: [
          "CSB2 Farafangana Centre",
          "CSB2 Ambalamaka",
          "CSB2 Mandraka",
          "CSB2 Andohatapenaka",
        ],
      
        Vondrozo: [
          "CSB2 Vondrozo Centre",
          "CSB2 Ivohibe",
          "CSB2 Ambatolahy",
          "CSB2 Antanimena",
        ],
      
        Vangaindrano: [
          "CSB2 Vangaindrano Centre",
          "CSB2 Anjahamana",
          "CSB2 Marolambo",
          "CSB2 Antanimena",
        ],
      
        MidongyDuSud: [
          "CSB2 Midongy du Sud Centre",
          "CSB2 Ambolomena",
          "CSB2 Andranovory",
          "CSB2 Ivohibe",
        ],
      
        Befotaka: [
          "CSB2 Befotaka Centre",
          "CSB2 Betroka",
          "CSB2 Amboasary",
          "CSB2 Soanierana",
        ],
      },
      "Antsinana": {
        ToamasinaI: [
          "CSB2 Toamasina Centre",
          "CSB2 Ambodifotatra",
          "CSB2 Ampasimazava",
          "CSB2 Antanambao",
        ],
      
        ToamasinaII: [
          "CSB2 Toamasina II Centre",
          "CSB2 Bealanana",
          "CSB2 Mananjary",
          "CSB2 Antsahamanitra",
        ],
      
        Brickaville: [
          "CSB2 Brickaville Centre",
          "CSB2 Ambohibary",
          "CSB2 Manakambahiny",
          "CSB2 Amborompotsy",
        ],
      
        Vatomandry: [
          "CSB2 Vatomandry Centre",
          "CSB2 Ambodiavy",
          "CSB2 Manakambahiny",
          "CSB2 Mahavelona",
        ],
      
        AntanambaoManampo: [
          "CSB2 Antanambao Manampo Centre",
          "CSB2 Ambohazo",
          "CSB2 Anosibe",
          "CSB2 Ambahikily",
        ],
      
        Mahanoro: [
          "CSB2 Mahanoro Centre",
          "CSB2 Ambohibary",
          "CSB2 Soavina",
          "CSB2 Mahanoro Sud",
        ],
      
        Marolambo: [
          "CSB2 Marolambo Centre",
          "CSB2 Antananarivo",
          "CSB2 Antsahabe",
          "CSB2 Anja",
        ],
      },
     " Betsiboka" : {
        Maevatanana: [
          "CSB2 Maevatanana Centre",
          "CSB2 Andoharano",
          "CSB2 Ambatomaninga",
          "CSB2 Mahitsy",
        ],
      
        Tsaratanana: [
          "CSB2 Tsaratanana Centre",
          "CSB2 Ambanivohitra",
          "CSB2 Bevoay",
          "CSB2 Sahatsara",
        ],
      
        Kandreho: [
          "CSB2 Kandreho Centre",
          "CSB2 Ampasina",
          "CSB2 Anosimainty",
          "CSB2 Ambodinonoka",
        ],
      },
      
      "Boeny": {
        MahajangaI: [
          "CSB2 Mahajanga Centre",
          "CSB2 Ambodirano",
          "CSB2 Mahavoky",
          "CSB2 Ambohijanahary",
        ],
      
        MahajangaII: [
          "CSB2 Mahajanga II Centre",
          "CSB2 Bealanana",
          "CSB2 Andranovondronina",
          "CSB2 Ampandriambao",
        ],
      
        Mintsinjo: [
          "CSB2 Mintsinjo Centre",
          "CSB2 Marohombey",
          "CSB2 Tsiroanomandidy",
          "CSB2 Antsahabe",
        ],
      
        Marovaoy: [
          "CSB2 Marovaoy Centre",
          "CSB2 Sahafa",
          "CSB2 Ampasindava",
          "CSB2 Andranomano",
        ],
      
        Soalala: [
          "CSB2 Soalala Centre",
          "CSB2 Tsarahonenana",
          "CSB2 Sahafalina",
          "CSB2 Ampanefy",
        ],
      
        Ambatoboeny: [
          "CSB2 Ambatoboeny Centre",
          "CSB2 Tanambao",
          "CSB2 Belon'i Tsara",
          "CSB2 Ambatofotsy",
        ],
      },
      
      "Bongolava": {
        Tsiroanomandidy: [
          "CSB2 Tsiroanomandidy Centre",
          "CSB2 Ambohitromby",
          "CSB2 Ambodimanga",
          "CSB2 Andranondambo",
        ],
      
        Fenoarivobe: [
          "CSB2 Fenoarivobe Centre",
          "CSB2 Anjiro",
          "CSB2 Ambodimanga",
          "CSB2 Mahazoarivo",
        ],
      },
      "Diana": {
        AntsirananaI: [
          "CSB2 Antsiranana Centre",
          "CSB2 Befandriana Nord",
          "CSB2 Ambanja",
          "CSB2 Ambilobe",
        ],
      
        AntsirananaII: [
          "CSB2 Antsiranana II Centre",
          "CSB2 Anivorano Nord",
          "CSB2 Bavanatolona",
          "CSB2 Sambava",
        ],
      
        Ambilobe: [
          "CSB2 Ambilobe Centre",
          "CSB2 Amboromotsy",
          "CSB2 Anjohibe",
          "CSB2 Anjiro",
        ],
      
        NosyBe: [
          "CSB2 Nosy Be Centre",
          "CSB2 Hell Ville",
          "CSB2 Ambatoloaka",
          "CSB2 Ambondrona",
        ],
      
        Ambanja: [
          "CSB2 Ambanja Centre",
          "CSB2 Andranovaky",
          "CSB2 Ampasikely",
          "CSB2 Maromandia",
        ],
      }, 
     "Fitovinany": {
        ManakaraAtsimo: [
          "CSB2 Manakara Centre",
          "CSB2 Antanimora",
          "CSB2 Ampasimazava",
          "CSB2 Ambohitsara",
        ],
      
        Ikongo: [
          "CSB2 Ikongo Centre",
          "CSB2 Bevalo",
          "CSB2 Ambodimanga",
          "CSB2 Mandromodromotra",
        ],
      
        Vohipeno: [
          "CSB2 Vohipeno Centre",
          "CSB2 Ampasimpotsy",
          "CSB2 Marofototra",
          "CSB2 Andovoka",
        ],
      },
      "Haute Matsiatra": {
        FianarantsoaI: [
          "CSB2 Fianarantsoa Centre",
          "CSB2 Antoetra",
          "CSB2 Iarivo",
          "CSB2 Ambalavato",
        ],
      
        Ambohimahsoa: [
          "CSB2 Ambohimahsoa Centre",
          "CSB2 Anosikely",
          "CSB2 Ambatofotsy",
          "CSB2 Miarinarivo",
        ],
      
        Ikalamavony: [
          "CSB2 Ikalamavony Centre",
          "CSB2 Ankaratra",
          "CSB2 Mandroso",
          "CSB2 Beronono",
        ],
      
        Isandra: [
          "CSB2 Isandra Centre",
          "CSB2 Ambohimanara",
          "CSB2 Ambohivato",
          "CSB2 Andranofotsy",
        ],
      
        Lalangina: [
          "CSB2 Lalangina Centre",
          "CSB2 Antsahamaniry",
          "CSB2 Antanambao",
          "CSB2 Andriampandry",
        ],
      
        Vohibato: [
          "CSB2 Vohibato Centre",
          "CSB2 Antanimbary",
          "CSB2 Marolambo",
          "CSB2 Ambaniala",
        ],
      
        Ambalavao: [
          "CSB2 Ambalavao Centre",
          "CSB2 Ambohimanarina",
          "CSB2 Behoririka",
          "CSB2 Ambalafary",
        ],
      },
      "Ihorombe": {
        Ihosy: [
          "CSB2 Ihosy Centre",
          "CSB2 Antanimbary",
          "CSB2 Ambohibary",
          "CSB2 Ambohidroa",
        ],
      
        Ivohabe: [
          "CSB2 Ivohabe Centre",
          "CSB2 Ambanivato",
          "CSB2 Ambohidroa",
          "CSB2 Ambohibola",
        ],
      
        Akora: [
          "CSB2 Akora Centre",
          "CSB2 Anosibe",
          "CSB2 Andranomaintso",
          "CSB2 Bevoahazo",
        ],
      },
      
      
      "Itasy": {
        Miarinarivo: [
          "CSB2 Miarinarivo Centre",
          "CSB2 Anosiala",
          "CSB2 Ambatolampy",
          "CSB2 Mahatsara",
        ],
      
        Arivonimamo: [
          "CSB2 Arivonimamo Centre",
          "CSB2 Ambohimarina",
          "CSB2 Ambodivato",
          "CSB2 Imerimandroso",
        ],
      
        Soavinandriana: [
          "CSB2 Soavinandriana Centre",
          "CSB2 Tsiroanomandidy",
          "CSB2 Ambodifasika",
          "CSB2 Fenoarivobe",
        ],
      },
      "Melaky": {
        Maintirano: [
          "CSB2 Maintirano Centre",
          "CSB2 Ankilimamba",
          "CSB2 Antsalova",
          "CSB2 Ambohimahaleo",
        ],
      
        Besalampy: [
          "CSB2 Besalampy Centre",
          "CSB2 Marovoay",
          "CSB2 Ampasimbe",
          "CSB2 Ambohimena",
        ],
      
        Ambatomainty: [
          "CSB2 Ambatomainty Centre",
          "CSB2 Ambilobe",
          "CSB2 Ampasika",
          "CSB2 Ivohibory",
        ],
      
        Morafone: [
          "CSB2 Morafeno",
          "CSB2 Ambatolava",
          "CSB2 Bealanana",
          "CSB2 Marofody",
        ],
      
        Antsalova: [
          "CSB2 Antsalova Centre",
          "CSB2 Maroala",
          "CSB2 Anse Colas",
          "CSB2 Ambohimahaleo",
        ],
      },
     "Menabe": {
        Moradanva: [
          "CSB2 Moradanva Centre",
          "CSB2 Ambatomainty",
          "CSB2 Tsaralalana",
          "CSB2 Marofandray",
        ],
      
        Miandrivazo: [
          "CSB2 Miandrivazo Centre",
          "CSB2 Ambatolahy",
          "CSB2 Ampasimbe",
          "CSB2 Manandona",
        ],
      
        BeloSurTsiribihina: [
          "CSB2 Belo Centre",
          "CSB2 Ambohimanarina",
          "CSB2 Ampanihy",
          "CSB2 Morarano",
        ],
      
        Mahabo: [
          "CSB2 Mahabo Centre",
          "CSB2 Ambohimena",
          "CSB2 Mandromodromotra",
          "CSB2 Tanambao",
        ],
      
        Manja: [
          "CSB2 Manja Centre",
          "CSB2 Ambatomanoina",
          "CSB2 Ambohimahaleo",
          "CSB2 Ampanihy",
        ],
      },
      "Sava": {
        Sambava: [
          "CSB2 Sambava Centre",
          "CSB2 Andramana",
          "CSB2 Antsahampano",
          "CSB2 Maroantsetra",
        ],
      
        Vohemara: [
          "CSB2 Vohemara Centre",
          "CSB2 Ankarana",
          "CSB2 Ambodimanga",
          "CSB2 Tsaratanana",
        ],
      
        Andapa: [
          "CSB2 Andapa Centre",
          "CSB2 Ampasimatera",
          "CSB2 Ambohimanoro",
          "CSB2 Ambavala",
        ],
      
        Antalaha: [
          "CSB2 Antalaha Centre",
          "CSB2 Tanambao",
          "CSB2 Mananara",
          "CSB2 Andranovory",
        ],
      },
      "Sofia": {
        Antsohihy: [
          "CSB2 Antsohihy Centre",
          "CSB2 Antsahabe",
          "CSB2 Anivorano",
          "CSB2 Ambohimiandra",
        ],
      
        Analalava: [
          "CSB2 Analalava Centre",
          "CSB2 Ambatozavavy",
          "CSB2 Mandritsara",
          "CSB2 Andranonony",
        ],
      
        Belalana: [
          "CSB2 Belalana Centre",
          "CSB2 Antanimena",
          "CSB2 Ambalahonko",
          "CSB2 Andranondrana",
        ],
      
        BefandrianaAvaratra: [
          "CSB2 Befandriana Centre",
          "CSB2 Andapa",
          "CSB2 Ambatolahy",
          "CSB2 Andilamena",
        ],
      
        PortBerge: [
          "CSB2 PortBerge Centre",
          "CSB2 Ambohimanga",
          "CSB2 Ambodivohitra",
          "CSB2 Antsahavana",
        ],
      
        Mandritsara: [
          "CSB2 Mandritsara Centre",
          "CSB2 Antsirabe",
          "CSB2 Manjakatompo",
          "CSB2 Ambodimanga",
        ],
      
        Mampikony: [
          "CSB2 Mampikony Centre",
          "CSB2 Manakambahiny",
          "CSB2 Ampanihy",
          "CSB2 Tanambao",
        ],
      }, 
      "Vakinankaratra": {
        AntsirabeI: [
          "CSB2 Antsirabe Centre",
          "CSB2 Ambohibary",
          "CSB2 Antsahabe",
          "CSB2 Andranovaky",
        ],
      
        Ambatolampy: [
          "CSB2 Ambatolampy Centre",
          "CSB2 Anjozorobe",
          "CSB2 Mahavelo",
          "CSB2 Antsaharamena",
        ],
      
        Faratsiho: [
          "CSB2 Faratsiho Centre",
          "CSB2 Andranovaky",
          "CSB2 Miarinarivo",
          "CSB2 Tanambao",
        ],
      
        Mandoto: [
          "CSB2 Mandoto Centre",
          "CSB2 Antanifotsy",
          "CSB2 Betafeno",
          "CSB2 Mahatsara",
        ],
      
        Antanifotsy: [
          "CSB2 Antanifotsy Centre",
          "CSB2 Ambohitrambato",
          "CSB2 Andasibe",
          "CSB2 Marofototra",
        ],
      
        Betafo: [
          "CSB2 Betafo Centre",
          "CSB2 Ambohitrambo",
          "CSB2 Andranolava",
          "CSB2 Ambondromifehy",
        ],
      
        AntsirabeII: [
          "CSB2 Antsirabe II Centre",
          "CSB2 Ambohitrambo",
          "CSB2 Andramasina",
          "CSB2 Mahatsara",
        ],
      },
      "Vatovavy": {
        NosyVakira: [
          "CSB2 Nosy Vakira Centre",
          "CSB2 Ambalavao",
          "CSB2 Antsaray",
          "CSB2 Marovato",
        ],
      
        Manajary: [
          "CSB2 Manajary Centre",
          "CSB2 Ambatofotsy",
          "CSB2 Tanambao",
          "CSB2 Andolofotsy",
        ],
      }

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
                background: 'linear-gradient(45deg, #79a7d3, #79a7d3)', // Dégradé linéaire avec la couleur #79a7d3
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
          <IonGrid style={{ width: '100%' }}>
            <IonRow>
               {/* Logo à gauche */}
              <IonCol size="auto">
                  <IonImg
                     src={logo}
                    alt="Logo gauche"
                    style={{ width: '30px', height: '30px' }}
                  />
              </IonCol> 

              {/* Titre de la page au centre */}
              <IonCol size="auto" style={{ textAlign: 'center', paddingLeft: '0px'  }}>
                <IonTitle style={{ color: 'white', margin: 0 }}>Connexion</IonTitle>
              </IonCol>

              {/* Logo à droite */}
              {/* <IonCol size="auto" style={{ right: '-75px' }}>
               
                  <IonImg
                     src={flag}
                    alt="Logo droit"
                    style={{ width: '40px', height: '30px' }}
                  />
                
              </IonCol> */}
            </IonRow>
          </IonGrid>
        </IonToolbar>
      </IonHeader>
      
        <IonContent fullscreen className="ion-padding">
          
            
       
                  <motion.div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: -1, // Placer l'arrière-plan en dessous du contenu
                    background: 'linear-gradient(45deg, #79a7d3 20%, #ffffff 30%, #79a7d3 80%)', // Dégradé avec du blanc au centre
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'], // Animation du dégradé
                  }}

                  transition={{
                    duration: 10, // Durée de l'animation
                    repeatType: 'loop', // Boucle infinie
                    ease: 'linear', // Transition fluide
                  }}
                ></motion.div>



          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent pullingText="Tirer pour rafraîchir" refreshingSpinner="circles" />
          </IonRefresher>

          

            

            {/* Avatar au milieu */}
            <IonAvatar style={{ width: '100px', height: '100px', margin: '0 auto' }}>
              <IonImg src={infi} alt="Avatar" />
            </IonAvatar>

                  <br />
            

            {/* Formulaire de connexion */}
            <IonItem style={{ marginBottom: '15px', '--background': 'transparent' }}>
              <IonInput
                value={username}
                onIonChange={(e) => setUsername(e.detail.value || '')}
                type="text"
                required
                label="Nom d'utilisateur"
                labelPlacement="floating"
                placeholder="Entrez votre nom d'utilisateur"
                style={{
                  color: 'black', // Texte de l'input en noir
                  '--placeholder-color': 'rgba(0, 0, 0, 0.7)', // Placeholder en noir translucide
                  '--color': 'black', // Couleur du label en noir
                }}
                
              />
            </IonItem>

            <IonItem style={{ '--background': 'transparent' }}>
              <IonInput
                value={password}
                onIonChange={(e) => setPassword(e.detail.value || '')}
                type={showPassword ? 'text' : 'password'}
                required
                label="Mot de passe"
                labelPlacement="floating"
                placeholder="Entrez votre mot de passe"
                style={{
                  color: 'black', // Texte de l'input en noir
                  '--placeholder-color': 'rgba(0, 0, 0, 0.7)', // Placeholder en noir translucide
                  '--color': 'black', // Couleur du label en noir
                }}
              />
              
              <IonIcon
                icon={showPassword ? eyeOffOutline : eyeOutline}
                slot="end"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  color: 'white', // Couleur de l'icône
                }}
              />
            </IonItem>
            <IonItem style={{ marginBottom: '15px', '--background': 'transparent' }}>
              <IonInput
                value={matricule}
                onIonChange={(e) => setMatricule(e.detail.value || '')}
                type="text"
                required
                label="Matricule"
                labelPlacement="floating"
                placeholder="Entrez le matricule"
                style={{
                  color: 'black', // Texte de l'input en noir
                  '--placeholder-color': 'rgba(0, 0, 0, 0.7)', // Placeholder en noir translucide
                  '--color': 'black', // Couleur du label en noir
                }}
                
              />
            </IonItem>

            {errorMessage && (
              <IonText color="danger">
                <p>{errorMessage}</p>
              </IonText>
            )}
            <br />
            <IonButton expand="full" onClick={handleLogin} color="primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <IonSpinner name="crescent" />
                  <span style={{ marginLeft: '10px' }}>Connexion en cours...</span>
                </>
              ) : (
                'Se connecter'
              )}
            </IonButton>
            <IonText color="primary" onClick={() => setIsModalOpen(true)}>
          <p style={{ textAlign: 'center', cursor: 'pointer', marginTop: '10px' }}>S'identifier en tant que personnel</p>
         </IonText>

            <IonToast
              isOpen={showToast}
              message={errorMessage || 'Connexion réussie!'}
              duration={2000}
              onDidDismiss={() => setShowToast(false)}
              color={errorMessage ? 'danger' : 'success'}
            />
             <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
              
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
                background: 'linear-gradient(45deg, #79a7d3, #79a7d3)', // Dégradé linéaire avec la couleur #79a7d3
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
              {/* <IonButtons slot="start" onClick={() => setIsModalOpen(false)}>
                 <IonBackButton defaultHref="/login" />
          </IonButtons> */}
              <IonTitle>Identification</IonTitle>
              <IonButton slot="end" onClick={() => setIsModalOpen(false)}>
              <IonIcon icon={closeOutline} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent fullscreen className="ion-padding" style={{ height: '0px', padding:'100px' }}>

          <motion.div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: -1, // Placer l'arrière-plan en dessous du contenu
                    background: 'linear-gradient(45deg, #79a7d3 20%, #ffffff 30%, #79a7d3 80%)',
                    height: '105vh',/// Dégradé avec du blanc au centre
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'], // Animation du dégradé
                  }}

                  transition={{
                    duration: 10, // Durée de l'animation
                    repeatType: 'loop', // Boucle infinie
                    ease: 'linear', // Transition fluide
                  }}
                ></motion.div>

<IonItem
  >
  <IonLabel
    position="stacked"
    className="custom-label"
    style={{
      color: '#00000',
      fontSize: '20px'  // Texte du label en blanc pour contraster avec le fond
    }}
  >
    Nom
  </IonLabel>

  <IonInput
    value={nom}
    onIonChange={(e) => setNom(e.detail.value || '')}
    placeholder="Entrer le Nom"
      />
</IonItem>

<IonItem
  
>
  <IonLabel
    position="stacked"
    className="custom-label"
    style={{
      color: '#00000',
      fontSize: '20px'// Texte en blanc
    }}
  >
    Prénom
  </IonLabel>
  <IonInput
    value={prenom}
    onIonChange={(e) => setPrenom(e.detail.value || '')}
    placeholder="Entrer le Prénom"
  
  />
</IonItem>

<IonItem
  
>
  <IonLabel position="stacked" style={{ color: '#00000', fontSize:'20px'}}>
    Email ou téléphone
  </IonLabel>
  <IonInput
    value={contact}
    onIonChange={(e) => setContact(e.detail.value || '')}
    placeholder="Entrer l'e-mail ou numéro téléphone"
  
  />
</IonItem>

<IonItem
  
>
  <IonLabel position="stacked" style={{ color: '#00000', fontSize:'20px' }}>
    CIN
  </IonLabel>
  <IonInput
    value={cin}
    onIonChange={(e) => setCin(e.detail.value || '')}
    placeholder="Entrer le CIN"
    maxlength={12}
  
  />
</IonItem>

<IonItem
  
>
  <IonLabel position="stacked" style={{ color: '#00000', fontSize:'20px' }}>
    Matricule
  </IonLabel>
  <IonInput
    value={matricule}
    onIonChange={(e) => setMatricule(e.detail.value || '')}
    placeholder="Entrer le matricule"
  
  />
</IonItem>

<IonItem
  
>
  <IonLabel position="stacked" style={{ color: '#00000', fontSize: '20px' }}>
    Région
  </IonLabel>
  <IonSelect
    value={region}
    onIonChange={(e) => setRegion(e.detail.value)}
  
  >
    {Object.keys(regionsWithDistrictsAndCommunes).map((regionName) => (
      <IonSelectOption key={regionName} value={regionName}>
        {regionName}
      </IonSelectOption>
    ))}
  </IonSelect>
</IonItem>

<IonItem
  
>
  <IonLabel position="stacked" style={{ color: '#00000', fontSize: '20px' }}>
    District
  </IonLabel>
  <IonSelect
    value={district}
    onIonChange={(e) => setDistrict(e.detail.value)}
    disabled={!region}
    style={{
      color: '#000000',
      '--placeholder-color': 'rgba(255, 255, 255, 0.7)',
    }}
  >
    {region &&
      Object.keys(regionsWithDistrictsAndCommunes[region]).map((districtName) => (
        <IonSelectOption key={districtName} value={districtName}>
          {districtName}
        </IonSelectOption>
      ))}
  </IonSelect>
</IonItem>

<IonItem
  
>
  <IonLabel position="stacked" style={{ color: '#00000', fontSize: '20px' }}>
    Commune
  </IonLabel>
  <IonSelect
    value={commune}
    onIonChange={(e) => setCommune(e.detail.value)}
    disabled={!district}
    
  >
    {region &&
      district &&
      regionsWithDistrictsAndCommunes[region][district].map((communeName: boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.Key | null | undefined) => (
        <IonSelectOption key={communeName} value={communeName}>
          {communeName}
        </IonSelectOption>
      ))}
  </IonSelect>

</IonItem>
<br />

            <motion.div
      initial={{ opacity: 0, scale: 0.8 }} // État initial : opacité 0 et taille réduite
      animate={{ opacity: 1, scale: 1 }} // Animation : opacité 1 et taille normale
      transition={{ duration: 0.5, ease: 'easeOut' }} // Durée et type de transition
      whileHover={{ scale: 1.1 }} // Effet de survol : agrandissement léger
      whileTap={{ scale: 0.95 }} // Effet au clic : rétrécissement
    >
      <IonButton expand="full" onClick={handleIdentification} className="custom-button">
        Valider
      </IonButton>
    </motion.div>
          </IonContent>
        </IonModal>
          
        </IonContent>
      
    </IonPage>
  );
};

export default Login;
function updateConnection(soignant: Soignant) {
  throw new Error('Function not implemented.');
}

