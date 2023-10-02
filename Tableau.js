import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet,Switch, Dimensions,Text, View,TouchableOpacity,ActivityIndicator,Alert } from 'react-native';
import { useNavigation,useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TableauScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params;
  const { token } = route.params;
  const tokenTab = {token};
  const { tokensubstr } = route.params;
  const { listRecord } = route.params;
//   var listRecordLenght = listRecord.length; 
  const [isLoading, setIsLoading] = useState(false);
  const [ligneEffacer, setLigneEffacer] = useState([]); 
  const [toggles, setToggles] = useState({}); // Utilisation d'un objet pour stocker les états des boutons de bascule

    const handleToggleMode = (recordID,date,fait) => {
      setToggles((prevToggles) => ({
        ...prevToggles,
        [recordID]: !prevToggles[recordID],
      }));

      handleToggleMode1(recordID,date,fait);
    };
  
  const handleToggleMode1 = (recordID,dateRecord,Ok) => {
    //$url = $FileMakerServer."/fmi/data/v1/databases/".$MaBase."/layouts/".$MonModele."/records/".$RecordID;
    var okAenvoyer = 1 ;
    if(Ok == 1 || Ok =="1"){
      okAenvoyer = "";
    }
    const url = "https://stcparis.gigaplanet.com/fmi/data/v1/databases/stc/layouts/PlanningJ_Api/records/"+recordID;

    const data =
        {
          fieldData : 
              {
                Fait : okAenvoyer,
                Date  : dateRecord,
              }
        };


    fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer `+ tokenTab.token,
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
      //mettre la valeur de ligne a effacer 
      setLigneEffacer((prevLigneEffacer) => {
        if (prevLigneEffacer.includes(recordID)) {
          return prevLigneEffacer.filter((id) => id !== recordID);
        } else {
          return [...prevLigneEffacer, recordID];
        }});
      // setIsEnabled((previousState) => !previousState);
    })
    .catch(error => {
      console.error('Error:', error);
      Alert.alert('Erreur','Erreur de la requête');
    });

  };

  const handleLogout = async () => {
    try {
      setIsLoading(true); // Début du chargement
      await AsyncStorage.removeItem('token'); // Effacer le token de l'utilisateur de AsyncStorage
      // Attendre 3 secondes avant d'afficher l'alerte de déconnexion réussie
      setTimeout(() => {
        setIsLoading(false); // Fin du chargement après le délai de 3 secondes
        Alert.alert('Déconnexion','Déconnexion réussie'); // Afficher une alerte pour indiquer que la déconnexion est réussie
        navigation.navigate('Authentication'); // Naviguer vers l'écran d'authentification après la déconnexion réussie
      }, 3000);
    } catch (error) {
      setIsLoading(false); // Fin du chargement en cas d'erreur
      console.error('Erreur lors de la déconnexion :', error);
    }
  };

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
     
       </View>
    
      <View style={styles.tablecontainer}>

      <View style={styles.headerRow}>
        <Text style={styles.headerCell}>Service</Text>
        <Text style={styles.headerCell}>Date</Text>
        <Text style={styles.headerCell}>Initiale</Text>
        <Text style={styles.headerCell}>OK</Text>
      </View>
      {listRecord.length === 0 ? (
    <Text style={styles.Vide}>Aucun enregistrement disponible.</Text>
) : (
      listRecord.map((record) => {
            var isDefaultChecked ; // pour le toggle par defaut
            if(record['fieldData']['Fait'] ==1 || record['fieldData']['Fait'] == "1"){
             isDefaultChecked = record['fieldData']['Fait'] === 1;
            }
            //console.log(isDefaultChecked);
            if(ligneEffacer.includes(record['fieldData']['RecordID'])){
              return null;
            }else{
             
              return(  <View style={styles.dataRow} >
                <Text style={styles.dataCell}>{record['fieldData']['Service']}</Text>
                <Text style={styles.dataCell}>{record['fieldData']['Date']}</Text>
                <Text style={styles.dataCell}>{ record['fieldData']['Initial'] }</Text>
                <View style={styles.dataCell}>
                <Switch
                  style={styles.toggleButton}
                  onValueChange={() => handleToggleMode(record['fieldData']['RecordID'],record['fieldData']['date'],record['fieldData']['Fait'])}
                  // value={toggles[record['fieldData']['RecordID']] || false}
                  value={toggles[record['fieldData']['RecordID']] !== undefined ? toggles[record['fieldData']['RecordID']] : isDefaultChecked}
                />
                </View>
            </View>)
            }
        })
)
    } 
     
      </View> 
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
headercontainer: {
      flex: 1,
      backgroundColor: '#ffff',
      alignItems: 'center',
      justifyContent: 'center',
    },     
tablecontainer: {
  borderWidth: 1,
  borderColor: '#ccc',
  margin: 10,
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
headerRow: {
  flexDirection: 'row',
  backgroundColor: '#f0f0f0',
},
headerCell: {
  flex: 1,
  padding: 10,
  fontWeight: 'bold',
},
dataRow: {
  flexDirection: 'row',
  borderBottomWidth: 1,
  borderBottomColor: '#ccc',
},
dataCell: {
  flex: 1,
  padding: 8,
},
toggleButton: {
  right: windowWidth / 8,
  bottom: windowHeight / 50,
},
toggleButtonText: {
  color: '#fff',
},
Vide: {
  flex : 1,
},
});

