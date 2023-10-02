import React, { useEffect, useRef, useState } from 'react';
import { View,Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import TableauScreen from './Tableau';
import axios from 'axios';


const ScannerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params;
  const { token } = route.params;
  const tokenTab = { token };
  const tokensubstr = tokenTab.token.substr(0, 5) + '...';

  // State to store the scanned QR code data
  const [scannedData, setScannedData] = useState(null);
  const [Haspermission, setHaspermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [responseText, setResponseText] = useState(null);
  const [isContinu , setIsContinu] = useState(false);

  // State pour gérer l'état de chargement
  const [isLoading, setIsLoading] = useState(false);

  // Reference to the barcode scanner instance
  const scannerRef = useRef(null);

    // Fonction de déconnexion
    const handleLogout = async () => {
      try {
        setIsLoading(true); // Début du chargement
        await AsyncStorage.removeItem('token'); // Effacer le token de l'utilisateur de AsyncStorage
        // Attendre 3 secondes avant d'afficher l'alerte de déconnexion réussie
        setTimeout(() => {
          setIsLoading(false); // Fin du chargement après le délai de 3 secondes
          alert('Déconnexion réussie'); // Afficher une alerte pour indiquer que la déconnexion est réussie
          navigation.navigate('Authentication'); // Naviguer vers l'écran d'authentification après la déconnexion réussie
        }, 3000);
      } catch (error) {
        setIsLoading(false); // Fin du chargement en cas d'erreur
        console.error('Erreur lors de la déconnexion :', error);
      }
    };

const playBeep = async () => {
  try {
    // Charger le son depuis le fichier 'beep.wav' dans le dossier 'assets'
    const soundObject = new Audio.Sound();
    await soundObject.loadAsync(require('./assets/beep.wav'));

    // Jouer le son
    await soundObject.playAsync();
  } catch (error) {
    console.error('Erreur lors de la lecture du son de bip:', error);
  }
};

// Function to handle QR code scanning
const handleScan = ({ type, data }) => {
  // Play the beep sound when QR code is successfully scanned
  playBeep();

  // Store the scanned QR code data in state
  setScannedData({ type, data });
 // console.log(data);
  setScanned(true);

  fetchData(data);
};

//fonction pour l'enregistrement des donnes dans le serveur de FileMaker 
  const fetchEnregistrementScanner = async (data) => {

    const url = 'https://stcparis.gigaplanet.com/fmi/data/v1/databases/stc/layouts/scanner/records';
      
    const JsonData = {
      fieldData:{
        RecordID : data,
        Table: "DevisFact",
        User: "Didier",
        //Service: service, // pour l'ajout des services à envoyer à FileMaker
      }
    };

      fetch(url,{
        method: 'POST',
        headers:{
          'Content-Type' : 'application/json',
          'Authorization' : `Bearer ${tokenTab.token}`,
        },
        body: JSON.stringify(JsonData),
      })
      .then(response => {
        return response.json();
      })
      .then(responseJson => {

        if(responseJson.messages[0].code == 200){
          Alert.alert('Erreur','L\'accès à l\'enregistrement est refusé');
        }

        console.log('enregistrer');
        
      })
      .catch(error => {
        console.error('ERREUR : ' + error.message);
      });

  }

  const fetchData = async (data) => {

    if( user.Mode == "stop" ){

      const url = 'https://stcparis.gigaplanet.com/fmi/data/v1/databases/stc/layouts/PlanningJ_Api/_find';

      const JsonData = {
        query: [
          {
            'Devis Fact::RecordID': '='+ data,
          },
        ],
      };

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer `+ tokenTab.token,
        },
        body: JSON.stringify(JsonData),
      })
      .then(response => response.json())
      .then(data => {

        if(data.messages[0].code == 200){
          Alert.alert('Erreur','L\'accès à l\'enregistrement est refusé');
        }else{

          fetchEnregistrementScanner(data);//enregistrement du qr_code scanner dans fileMaker

          // console.log(data['response']);
          var listRecord = [];

          if(data['response']['data'] !== undefined){
            listRecord = data['response']['data'];   
          }      
          navigation.navigate('Tableau', { user: user, token: token ,listRecord: listRecord ,tokensubstr:tokensubstr});
          }
        
      })
      .catch(error => {
        console.error('Error:', error);        
        Alert.alert('Erreur','Erreur de la requête');
      });

    }
    if ( user.Mode == "continu") {
      //console.log('continu')

      const url = "https://stcparis.gigaplanet.com/fmi/data/v1/databases/stc/layouts/PlanningJ_Api/records";

      const JsonData = {
            fieldData: {
              RecordID: data,
              Table: 'DevisFact',
              User: 'Didier',
            },
          };

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer `+ tokenTab.token,
        },
        body: JSON.stringify(JsonData),
      })
      .then(response => response.json())
      .then(data => {
        console.log('Response:', data);
        if(data.messages[0].code == 200){
          Alert.alert('Erreur','L\'accès à l\'enregistrement est refusé');
        }else{
         fetchEnregistrementScanner(data);//enregistrement du qr_code scanner dans fileMaker
        }
        // return;
      })
      .catch(error => {
        console.error('Error:', error);
        Alert.alert('Erreur','Erreur de la requête');
      });
    }
    
};

  // Request camera permission and start the scanner
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
       setHaspermission (status === 'granted')
    })();


  }, []);

  return (
    <View style={styles.container}>

      {/* Display the user data from the context */}
      <View style={styles.titleContainer}>   

        <Text> {user.Initiales} :  {tokensubstr}</Text>
              {/* Bouton Déconnexion */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          {isLoading ? (
            <ActivityIndicator size="small" color="white" /> // Indicateur de chargement
          ) : (
            <Text style={styles.logoutButtonText}>Déconnexion</Text> // Texte du bouton une fois le chargement terminé
          )}
        </TouchableOpacity>
        <Text style={styles.title}>Bonjour {user.Login}, veuillez scanner votre QR Code:</Text>
     
      </View>

      {scanned ?  ( isContinu ? null : (    
        <View style={styles.scannedDataContainer}>
          {/* <Text style={styles.scannedDataType}>Type: {scannedData.type}</Text>
          <Text style={styles.scannedDataValue}>Valeur: {scannedData.data}</Text> */}
          <Text style={styles.scannedDataValue}>QR code scanné avec succès</Text>
          <TouchableOpacity style={styles.button} onPress={() => {setScanned(false);}}>
            <Text style={styles.buttonText}>Continuer</Text>
          </TouchableOpacity>
        </View>)
      ):( 
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            style={styles.scanner}
            onBarCodeScanned={ scanned ? undefined : handleScan}
            ref={scannerRef}
          />
        </View>)
        }
    </View>
  );
};

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9ecef',
  },
  titleContainer:{ 
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderRadius: 10,   
    backgroundColor: '#ffffff',
  },
  title:{
    fontSize: 20,
    color: '#0061DF',
  },
  scannerContainer: {
    flex: 0.7,
    height:20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 40,
    overflow: 'hidden',
  },
  scanner: {
    flex: 1,
    width: '100%',
    aspectRatio: 1, // To ensure it stays square
  },
  scannedDataContainer: {
    position: 'absolute',
    bottom: windowHeight / 2,
    left: windowWidth / 8,
    width: windowWidth * 3 / 4,
    height: windowHeight / 6,
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 10,    
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannedDataType: {
    color: 'black',
    fontSize: 16,
    marginBottom: 5,
  },
  scannedDataValue: {
    color: 'black',
    fontSize: 18,
    marginBottom: 5,
  },
  button: {
    backgroundColor: 'green',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop:5,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: 'red',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ScannerScreen;
