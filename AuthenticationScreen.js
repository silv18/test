// AuthenticationScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet,ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import utilisateurs from './utilisateurs.json';
import axios from 'axios';
import { encode, decode } from 'base-64';

// Assurez-vous d'ajouter cette ligne pour permettre l'encodage en base64
if (!global.btoa) global.btoa = encode;
if (!global.atob) global.atob = decode;

const FileMakerServer = 'https://stcparis.gigaplanet.com';
const MaBase = 'stc';
const username = 'allan';
const userpass = 'AllanFromMada';

const AuthenticationScreen = () => {
  const encodeBase64 = (str) => {
    return btoa(str);
  };

  const encodedCredentials = encodeBase64(`${username}:${userpass}`);

  const navigation = useNavigation();
  const [identifiant, setIdentifiant] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // État pour stocker le token
  // State pour gérer l'état de chargement
  const [isLoading, setIsLoading] = useState(false);

  const authenticate = async (identification) => {
    try {
      const response = await axios.post(`https://stcparis.gigaplanet.com/fmi/data/v1/databases/${MaBase}/sessions`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${encodedCredentials}`,
          },
        }
      );

      const token = response?.data?.response?.token;
      if (token) {
        return { token };
      } else {
        throw new Error('Échec de l\'authentification');
      }
      // const token = Math.floor(Math.random() * 100000);
      // return { token };
    } catch (error) {
      // throw new Error('Erreur lors de l\'appel au serveur FileMaker');
      console.error(error);
    }
  };


  


  const handleVerification = async () => {
    setIsLoading(true);
    try {
      const utilisateur = utilisateurs.find(user => user.Initiales === identifiant);
      if (utilisateur) {
        //console.log('Utilisateur trouvé :', utilisateur);
        setUser(utilisateur);

        // Appeler la fonction d'authentification pour obtenir le token
        const { token } = await authenticate(identifiant);

        //console.log('token trouvé :', token);

        // Stocker le token dans l'état
        setToken(token);

        navigation.navigate('Scanner', { user: utilisateur, token: token });
        setIsLoading(false);
      } else {
        alert('Utilisateur non trouvé ou login incorrect.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du login :', error);
      setIsLoading(false);
    }
  };

  // Define styles for dark mode
  const darkModeStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000000',
    },
    header: {
      fontSize: 24,
      color: '#ffffff',
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      marginBottom: 10,
      color: '#ffffff',
    },
    input: {
      width: 200,
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      paddingHorizontal: 10,
      marginBottom: 20,
      color: '#ffffff',
    },
    button: {
      backgroundColor: 'green',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 5,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
    },
    toggleButton: {
      marginTop: 20,
      padding: 10,
    },
    toggleButtonText: {
      color: '#fff',
    },
  });

  // Define styles for light mode
  const lightModeStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#ffffff',
    },
    header: {
      fontSize: 24,
      color: '#0061DF',
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      marginBottom: 10,
    },
    input: {
      width: 200,
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      paddingHorizontal: 10,
      marginBottom: 20,
    },
    button: {
      backgroundColor: 'green',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 5,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
    },
    toggleButton: {
      marginTop: 20,
      padding: 10,
    },
    toggleButtonText: {
      color: '#0061DF',
    },
  });

  const styles = isDarkMode ? darkModeStyles : lightModeStyles; // Use styles based on the selected mode

  const handleToggleMode = () => {
    setIsDarkMode(prevMode => !prevMode); // Toggle the mode when the button is pressed
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>AUTHENTIFICATION</Text>
      <View style={styles.form}>
        <Text style={styles.label}>Saisir votre code svp :</Text>
        <TextInput
          style={styles.input}
          onChangeText={text => setIdentifiant(text)}
          value={identifiant}
          placeholder="Code d'authentification"
        />
        <TouchableOpacity style={styles.button} onPress={handleVerification}>
        {isLoading ? (
            <ActivityIndicator size="small" color="white" /> // Indicateur de chargement
          ) : (
            <Text style={styles.buttonText}>Vérifier</Text> // Texte du bouton une fois le chargement terminé
          )}
    </TouchableOpacity>

       {/* Toggle switch */}
       <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Mode sombre :</Text>
          <Switch
            trackColor={{ false: '#ccc', true: '#0061DF' }}
            thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
            ios_backgroundColor="#ccc"
            onValueChange={handleToggleMode}
            value={isDarkMode}
          />
        </View>
      </View>
    </View>
  );
};

export default AuthenticationScreen;
