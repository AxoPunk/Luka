import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from './theme';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const scrollViewRef = React.useRef();

  const chatContainerStyle = {
    flexGrow: 1,
    justifyContent: messages.length > 0 ? 'flex-end' : 'center',
    padding: 10,
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');

    try {
      const endpoint = ''; //URL Azure IA Studio
      const apiKey = ''; // Tu clave API

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey, // Aquí aseguramos que esté bien escrito
        },
        body: JSON.stringify({
          messages: [{ role: "system", content: "Eres un asistente útil." }, newMessage],
          max_tokens: 800,
          temperature: 0.7,
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const botMessage = { role: 'assistant', content: result.choices[0].message.content };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      const errorMessage = { role: 'assistant', content: 'Hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.' };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={chatContainerStyle}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <Text style={styles.placeholder}>
            ¡Hola! Mi nombre es Luka, soy una IA que está aquí para escucharte y ayudarte.
          </Text>
        ) : (
          messages.map((msg, index) => (
            <Text
              key={index}
              style={[
                styles.message,
                msg.role === 'user' ? styles.userMessage : styles.botMessage,
              ]}
            >
              {msg.content}
            </Text>
          ))
        )}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={() => setMessages([])} style={styles.clearIcon}>
          <Icon name="trash-can-outline" size={24} color="#888" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu mensaje..."
          value={input}
          onChangeText={setInput}
        />
        <Button title="Enviar" onPress={sendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 0,
  },
  chatContainer: {
    flex: 1,
  },
  message: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1e7dd',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f8d7da',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  placeholder: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginHorizontal: 20,
  },
  clearIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginRight: 10,
  },
});
