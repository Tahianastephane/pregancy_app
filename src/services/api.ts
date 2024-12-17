// /src/services/api.ts

interface Patient {
    telephone: string;
    nom: string;
    prenom: string;
    rappel?: string;
    ddr?: string; // Date de rendez-vous
  }
  
  export const fetchData = async <T>(url: string, method: string = 'GET', body: any = null): Promise<T> => {
    try {
      const token = localStorage.getItem('token'); // Récupérer le token de l'utilisateur
      if (!token) {
        throw new Error('Token non trouvé');
      }
  
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`, // Utilisation du token pour l'authentification
        'Content-Type': 'application/json', // Définir le type de contenu comme JSON
      };
  
      const options: RequestInit = { method, headers };
      if (body) {
        options.body = JSON.stringify(body); // Si une donnée est envoyée (ex: POST), l'ajouter dans la requête
      }
  
      const response = await fetch(url, options);
  
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
  
      const data: T = await response.json(); // Convertir la réponse en JSON
      return data; // Retourner les données récupérées
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      throw error; // Rejeter l'erreur pour permettre à l'appelant de la gérer
    }
  };
  