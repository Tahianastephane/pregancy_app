import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import Home from './pages/Home/Home';
import PatientForm from './pages/register/PateintsFrom'; 
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle } from 'ionicons/icons';
import login from './pages/login/login';

import PatientDetails from './pages/register/PateintDetails';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
// import './theme/variables.css';
import PatientAntes from './pages/register/PatientAntes';
import VoirAntecedent from './pages/register/PatientAntesVoir';
import MessagePage from './pages/Message/message';
import ConversationPage from './pages/Message/conversation';
import Statistics from './pages/statistics/statistics';
import Consultations from './pages/consultaitons/Consultations';
import RendezVousPage from './pages/consultaitons/consultaionsdetails';
import splash from './pages/images/splash.png';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SearchPage from './pages/SearchPage/SearchPage';


setupIonicReact();

const SplashScreen: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Animation et bordure ronde appliquées au logo */}
      <motion.img
        src={splash}
        alt="Logo"
        style={{
          width: '200px',
          borderRadius: '50%', // Bordure ronde
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Ombre portée pour un effet de profondeur
        }}
        initial={{ opacity: 0, scale: 0 }} // État initial (opacité 0 et taille réduite)
        animate={{ opacity: 1, scale: 1 }} // Animation vers l'opacité 1 et taille normale
        transition={{ duration: 1 }} // Durée de l'animation (1 seconde)
      />
    </div>
  );
};

const App: React.FC = () => {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 3000); // Durée d'affichage du Splash

    return () => clearTimeout(timer);
  }, []);

  if (isSplashVisible) {
    return <SplashScreen />;
  }

  return (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route path="/login" component={login} exact />
      
        <Route path="/home" component={Home} exact />

        <Route  path="/patient-form" component={PatientForm} exact/>
        <Route  path="/patient-antes" component={PatientAntes} exact/>
        <Route exact path="/patient-details" component={PatientDetails} />
        <Route exact path="/voir-antecedent" component={VoirAntecedent} />
        <Route exact path="/message" component={MessagePage} />
        <Route exact path="/conversation" component={ConversationPage} />
        <Route exact path="/statistics" component={ Statistics} />
        <Route exact path="/Consultations" component={ Consultations} />
        <Route exact path="/recherche" component={ SearchPage} />
        <Route exact path="/RendezVousPage" component={ RendezVousPage} />
        <Route path="/RendezVousPage/:patientId" component={RendezVousPage} />

        <Route exact path="/" render={() => <Redirect to="/login" />} />
        
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
  );
};



export default App;
