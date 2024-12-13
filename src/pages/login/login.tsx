import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonItem, IonInput, IonText, IonIcon, IonToast, IonRefresher, IonRefresherContent } from '@ionic/react';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { getAdmin } from '../database/database';
import bcrypt from 'bcryptjs';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const history = useHistory();



  const handleLogin = async () => {
    const admin = await getAdmin();
    console.log('Admin récupéré:', admin);
  
    if (admin && admin.length > 0) {
      const storedAdmin = admin[0];
  
      if (!password) {
        setErrorMessage('');
        setShowToast(true);
        return;
      }
  
      // Vérification que storedAdmin.password est bien une chaîne de caractères
      if (typeof storedAdmin.password !== 'string' || !storedAdmin.password) {
        setErrorMessage('Le mot de passe de l\'administrateur est invalide');
        setShowToast(true);
        return;
      }
      console.log('Mot de passe stocké:', storedAdmin.password);  // Vérifiez la valeur du mot de passe

      const passwordMatch = bcrypt.compareSync(password, storedAdmin.password);
  
      if (username === storedAdmin.username && passwordMatch) {
        history.push('/home');
      } else {
        setErrorMessage('Nom d\'utilisateur ou mot de passe incorrect');
        setShowToast(true);
      }
    } else {
      setErrorMessage('Aucun administrateur trouvé');
      setShowToast(true);
    }
  };
  

  const handleRefresh = (event: CustomEvent) => {
    setUsername('');
    setPassword('');
    setErrorMessage('');
    setShowPassword(false);
    event.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Connexion</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingText="Tirer pour rafraîchir" refreshingSpinner="circles" />
        </IonRefresher>

        <div className="ion-text-center">
          <IonTitle>Bienvenue</IonTitle>
          <br />
          <br />

          <IonItem style={{ marginBottom: '15px' }}>
            <IonInput
              value={username}
              onIonChange={e => setUsername(e.detail.value!)}
              type="text"
              required
              label="Nom d'utilisateur"
              labelPlacement="floating"
              placeholder="Entrez votre nom d'utilisateur"
            />
          </IonItem>

          <IonItem>
            <IonInput
              value={password}
              onIonChange={e => setPassword(e.detail.value!)}
              type={showPassword ? 'text' : 'password'}
              required
              label="Mot de passe"
              labelPlacement="floating"
              placeholder="Entrez votre mot de passe"
            />
            <IonIcon
              icon={showPassword ? eyeOffOutline : eyeOutline}
              slot="end"
              onClick={() => setShowPassword(!showPassword)}
            />
          </IonItem>

          {errorMessage && (
            <IonText color="danger">
              <p>{errorMessage}</p>
            </IonText>
          )}
          <br />
          <IonButton expand="full" onClick={handleLogin} color="primary">
            Se connecter
          </IonButton>

          <IonToast
            isOpen={showToast}
            message={errorMessage || 'Connexion réussie!'}
            duration={2000}
            onDidDismiss={() => setShowToast(false)}
            color={errorMessage ? 'danger' : 'success'}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
