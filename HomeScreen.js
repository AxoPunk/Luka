import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Animated, Easing, Dimensions, ImageBackground, Modal, Pressable, ScrollView } from 'react-native';
import { COLORS } from './theme';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { app } from './firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const CARD_WIDTH = Dimensions.get('window').width * 0.85;

export default function HomeScreen() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showCards, setShowCards] = useState(false);
  const [tips, setTips] = useState([]);
  const [userName, setUserName] = useState('');
  const [greetingEmoji, setGreetingEmoji] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', description: '', emoji: '' });
  const welcomeAnim = useRef(new Animated.Value(0)).current;
  const [quickResources, setQuickResources] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef();
  const [tipOfDay, setTipOfDay] = useState(null);
  const [favoriteTips, setFavoriteTips] = useState([]);
  const [helpCenters, setHelpCenters] = useState([]);

  const emojiList = ['😊', '🌞', '🌈', '✨', '💫', '🌻', '🌟', '🦋', '🍀', '💚', '😃', '🙌', '🥰', '😺', '🧘‍♂️', '🧡', '🌸', '☀️', '🌼', '😎'];

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(welcomeAnim, {
        toValue: -200, // Desplaza hacia arriba
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setShowWelcome(false);
        setShowCards(true);
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showCards) {
      const fetchTips = async () => {
        try {
          const db = getFirestore(app);
          const querySnapshot = await getDocs(collection(db, 'emotional_tips'));
          const tipsArr = [];
          querySnapshot.forEach((doc) => {
            tipsArr.push(doc.data());
          });
          setTips(tipsArr);
        } catch (error) {
          console.log('Error al obtener tips:', error);
        }
      };
      fetchTips();
    }
  }, [showCards]);

  useEffect(() => {
    // Obtener el nombre del usuario desde Firestore usando el código guardado
    const fetchUserName = async () => {
      try {
        const code = await AsyncStorage.getItem('codigoValidadoId');
        if (!code) return;
        const db = getFirestore(app);
        const docRef = doc(db, 'codeInvite', code);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserName(data.nombre || '');
        }
      } catch (e) {
        setUserName('');
      }
    };
    fetchUserName();
  }, []);

  useEffect(() => {
    // Elegir un emoji aleatorio para el saludo
    setGreetingEmoji(emojiList[Math.floor(Math.random() * emojiList.length)]);
  }, []);

  useEffect(() => {
    // Obtener recursos rápidos desde Firestore
    const fetchQuickResources = async () => {
      try {
        const db = getFirestore(app);
        const querySnapshot = await getDocs(collection(db, 'quick_resources'));
        const resourcesArr = [];
        querySnapshot.forEach((doc) => {
          resourcesArr.push(doc.data());
        });
        setQuickResources(resourcesArr);
      } catch (error) {
        console.log('Error al obtener recursos rápidos:', error);
      }
    };
    fetchQuickResources();
  }, []);

  // Mostrar recursos en orden aleatorio
  useEffect(() => {
    if (quickResources.length > 1) {
      // Mezclar el array de recursos
      const shuffled = [...quickResources].sort(() => Math.random() - 0.5);
      setQuickResources(shuffled);
    }
  }, [quickResources.length]);

  // Deslizar automáticamente los recursos
  useEffect(() => {
    if (quickResources.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % quickResources.length;
          if (scrollRef.current) {
            scrollRef.current.scrollTo({ x: next * 120, animated: true });
          }
          return next;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [quickResources]);

  // Cargar favoritos guardados
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favs = await AsyncStorage.getItem('favoriteTips');
        if (favs) setFavoriteTips(JSON.parse(favs));
      } catch {}
    };
    loadFavorites();
  }, []);

  // Elegir tip del día fijo por fecha
  useEffect(() => {
    if (tips.length > 0) {
      const today = new Date();
      const dateKey = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      let tipIndex = 0;
      // Hash simple para que el tip cambie cada día pero sea igual para todos
      for (let i = 0; i < dateKey.length; i++) {
        tipIndex += dateKey.charCodeAt(i);
      }
      tipIndex = tipIndex % tips.length;
      setTipOfDay(tips[tipIndex]);
    }
  }, [tips]);

  // Marcar/desmarcar favorito
  const toggleFavorite = async (tip) => {
    let updated;
    if (favoriteTips.some(f => f.text === tip.text)) {
      updated = favoriteTips.filter(f => f.text !== tip.text);
    } else {
      updated = [...favoriteTips, tip];
    }
    setFavoriteTips(updated);
    await AsyncStorage.setItem('favoriteTips', JSON.stringify(updated));
  };

  const handlePress = () => {
    Linking.openURL('https://calendar.google.com/calendar/appointments/schedules/AcZssZ0S2sJX_RlcO_-GprupUmd4y9ZrFbjszpHOjQDj4k7FrIjWznLH2lupxrbhoSRX69LYGPlJdJeV?gv=true');
  };

  // Obtener centros de ayuda desde Firestore
  useEffect(() => {
    const fetchHelpCenters = async () => {
      try {
        const db = getFirestore(app);
        const querySnapshot = await getDocs(collection(db, 'help_centers'));
        const centersArr = [];
        querySnapshot.forEach((doc) => {
          centersArr.push(doc.data());
        });
        setHelpCenters(centersArr);
      } catch (error) {
        console.log('Error al obtener help_centers:', error);
      }
    };
    fetchHelpCenters();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Mostrar el header solo después de la animación de bienvenida */}
        {!showWelcome && (
          <View style={styles.headerContainer}>
            <Text style={styles.header}>MindCare</Text>
            {userName ? (
              <Text style={styles.greeting}>{greetingEmoji} ¡Hola, {userName}! {greetingEmoji}</Text>
            ) : null}
          </View>
        )}
        {/* Título pequeño para recursos rápidos, debajo del saludo y arriba del carrusel */}
        {!showWelcome && (
          <View style={styles.centeredSection}>
            <Text style={styles.quickAccessTitle}>Recursos rápidos</Text>
            {/* Carrusel de recursos rápidos */}
            <View style={styles.quickAccessContainer}>
              <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0 }}
                contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}
                snapToInterval={120}
                decelerationRate="fast"
              >
                {quickResources.map((res, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.quickAccessCard}
                    onPress={() => {
                      setModalContent(res);
                      setModalVisible(true);
                    }}
                  >
                    <Text style={styles.quickAccessEmoji}>{res.emoji}</Text>
                    <Text style={styles.quickAccessText}>{res.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            {/* Tip del día debajo del carrusel */}
            {showCards && tipOfDay && (
              <View style={styles.tipOfDayContainer}>
                <Text style={styles.tipOfDayTitle}>Tip del día</Text>
                <View style={{ width: CARD_WIDTH, alignItems: 'center', justifyContent: 'center' }}>
                  {tipOfDay.imageUrl ? (
                    <ImageBackground source={{ uri: tipOfDay.imageUrl }} style={styles.card} imageStyle={styles.cardBgImage}>
                      <View style={styles.overlay}>
                        <Text style={styles.cardText}>{tipOfDay.text}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.tipFavoriteIcon}
                        onPress={() => toggleFavorite(tipOfDay)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={favoriteTips.some(f => f.text === tipOfDay.text) ? 'heart' : 'heart-outline'}
                          size={28}
                          color={favoriteTips.some(f => f.text === tipOfDay.text) ? '#FF5A5F' : COLORS.textSecondary}
                        />
                      </TouchableOpacity>
                    </ImageBackground>
                  ) : (
                    <View style={styles.card}>
                      <Text style={styles.cardText}>{tipOfDay.text}</Text>
                      <TouchableOpacity
                        style={styles.tipFavoriteIcon}
                        onPress={() => toggleFavorite(tipOfDay)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={favoriteTips.some(f => f.text === tipOfDay.text) ? 'heart' : 'heart-outline'}
                          size={28}
                          color={favoriteTips.some(f => f.text === tipOfDay.text) ? '#FF5A5F' : COLORS.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}
            {/* Carrusel de ayuda profesional debajo del tip del día */}
            {showCards && helpCenters.length > 0 && (
              <View style={styles.helpCentersSection}>
                <Text style={styles.helpCentersTitle}>Contactar a un profesional</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flexGrow: 0, marginTop: 6 }}
                  contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 8 }}
                  snapToInterval={CARD_WIDTH + 16}
                  decelerationRate="fast"
                >
                  {helpCenters.map((center, idx) => (
                    <View key={idx} style={[styles.helpCenterCard, center.imageUrl ? {} : { backgroundColor: COLORS.secondary }]}> 
                      {center.imageUrl ? (
                        <ImageBackground source={{ uri: center.imageUrl }} style={styles.helpCenterImage} imageStyle={{ borderRadius: 16 }}>
                          <View style={styles.helpCenterOverlay}>
                            <Text style={styles.helpCenterName}>{center.name}</Text>
                            <Text style={styles.helpCenterDelegacion}>{center.delegacion}</Text>
                            <Text style={styles.helpCenterHorario}>{center.horario}</Text>
                            <TouchableOpacity style={styles.helpCenterPhoneBtn} onPress={() => Linking.openURL(`tel:${center.telefono}`)}>
                              <Ionicons name="call" size={20} color="#fff" />
                              <Text style={styles.helpCenterPhoneText}>{center.telefono}</Text>
                            </TouchableOpacity>
                          </View>
                        </ImageBackground>
                      ) : (
                        <View style={styles.helpCenterOverlay}>
                          <Ionicons name="person-circle" size={38} color={COLORS.primary} style={{ marginBottom: 4 }} />
                          <Text style={styles.helpCenterName}>{center.name}</Text>
                          <Text style={styles.helpCenterDelegacion}>{center.delegacion}</Text>
                          <Text style={styles.helpCenterHorario}>{center.horario}</Text>
                          <TouchableOpacity style={styles.helpCenterPhoneBtn} onPress={() => Linking.openURL(`tel:${center.telefono}`)}>
                            <Ionicons name="call" size={20} color="#fff" />
                            <Text style={styles.helpCenterPhoneText}>{center.telefono}</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}
        <View style={styles.container}>
          {showWelcome && (
            <Animated.View style={{
              transform: [{ translateY: welcomeAnim }],
              alignItems: 'center',
              width: '100%',
            }}>
              <Text style={{ fontSize: 24, color: COLORS.primary }}>Bienvenido a MindCare</Text>
              <Text style={{ fontSize: 18, color: COLORS.text, marginTop: 16, textAlign: 'center' }}>
                Gracias por formar de nuestra beta cerrada.</Text>
            </Animated.View>
          )}
          {showCards && (
            <View style={styles.cardsContainer}>
              {tips.map((tip, idx) => (
                tip.imageUrl ? (
                  <ImageBackground key={idx} source={{ uri: tip.imageUrl }} style={styles.card} imageStyle={styles.cardBgImage}>
                    <View style={styles.overlay}>
                      <Text style={styles.cardText}>{tip.text}</Text>
                    </View>
                  </ImageBackground>
                ) : (
                  <View key={idx} style={styles.card}>
                    <Text style={styles.cardText}>{tip.text}</Text>
                  </View>
                )
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      {/* FAB flotante SIEMPRE visible en esquina inferior derecha */}
      {showCards && (
        <View
          style={[
            styles.fabFloating,
            { right: 20, left: undefined, bottom: 40, position: 'absolute', zIndex: 9999, elevation: 20 }
          ]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={styles.fabSmall}
            onPress={handlePress}
            activeOpacity={0.85}
          >
            <Ionicons name="calendar" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
      {/* Modal para mostrar info del recurso */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>{modalContent.emoji}</Text>
            <Text style={styles.modalTitle}>{modalContent.title}</Text>
            <Text style={styles.modalDesc}>{modalContent.description}</Text>
            <Pressable style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
    zIndex: 2,
  },
  header: {
    fontSize: 32,
    color: COLORS.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 20,
    color: COLORS.primary,
    marginBottom: 22, // Menos espacio debajo del saludo
    textAlign: 'center',
    paddingTop: 18,
  },
  centeredSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  quickAccessTitle: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 6, // Menos espacio debajo del título
    marginTop: 0,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 14, // Menos espacio debajo del carrusel
    gap: 10,
    width: '100%',
  },
  quickAccessCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    minWidth: 110,
    maxWidth: 120,
    elevation: 2,
  },
  quickAccessEmoji: {
    fontSize: 28,
    marginBottom: 2,
  },
  quickAccessText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardsContainer: {
    width: '100%',
    marginTop: 18, // Menos espacio arriba de las cards
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    marginVertical: 8,
    width: CARD_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    minHeight: 120,
  },
  cardBgImage: {
    borderRadius: 16,
    resizeMode: 'cover',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 16,
    padding: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  fabFloating: {
    position: 'absolute',
    zIndex: 9999,
    elevation: 20,
    // right y bottom se definen en línea
  },
  fabSmall: {
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    width: 300,
    elevation: 8,
  },
  modalEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 18,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 28,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Estilos para el tip del día
  tipOfDayContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 0, // Sin margen extra
    marginTop: 0,
  },
  tipOfDayTitle: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 6, // Un poco más de espacio debajo del título
    textAlign: 'center',
    alignSelf: 'center',
  },
  tipFavoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 14,
    zIndex: 2,
  },
  helpCentersSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  helpCentersTitle: {
    fontSize: 17,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  helpCenterCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    marginHorizontal: 8,
    marginBottom: 8,
    padding: 0,
    overflow: 'hidden',
    elevation: 3,
    backgroundColor: COLORS.secondary,
  },
  helpCenterImage: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    justifyContent: 'flex-end',
  },
  helpCenterOverlay: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpCenterName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  helpCenterDelegacion: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 2,
    textAlign: 'center',
  },
  helpCenterHorario: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  helpCenterPhoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  helpCenterPhoneText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 6,
  },
});
