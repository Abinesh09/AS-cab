import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WS_BASE_URL } from '../../constants/config';
import { chatService } from '../../services/apiService';

interface Message {
  id: number;
  booking_id: number;
  sender_id: number;
  message: string;
  created_at: string;
  sender?: { name: string };
}

export default function ChatScreen({ route }: any) {
  const { bookingId } = route.params;
  const { user } = useSelector((s: RootState) => s.auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadHistory();
    connectWS();
    return () => { wsRef.current?.close(); };
  }, []);

  const loadHistory = async () => {
    try {
      const res = await chatService.getHistory(bookingId);
      setMessages(res.data.messages ?? []);
    } catch { /* silent */ }
  };

  const connectWS = async () => {
    const token = await AsyncStorage.getItem('auth_token');
    const url = `${WS_BASE_URL}/ws/chat?booking_id=${bookingId}&token=${token}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'history') return; // already loaded

      if (data.sender_id) {
        // Incoming broadcast message
        const msg: Message = {
          id: Date.now(),
          booking_id: data.booking_id,
          sender_id: data.sender_id,
          message: data.message,
          created_at: data.timestamp,
        };
        setMessages((prev) => [...prev, msg]);
      } else if (data.type === 'sent') {
        // Our message confirmed
        setMessages((prev) => [...prev, data.message]);
      }
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };
  };

  const sendMessage = () => {
    if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ message: text.trim() }));
    setText('');
  };

  const formatTime = (ts: string) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === user?.id;
    return (
      <View style={[styles.msgWrapper, isMe ? styles.msgRight : styles.msgLeft]}>
        {!isMe && (
          <Text style={styles.msgSender}>{item.sender?.name ?? 'Admin'}</Text>
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
            {item.message}
          </Text>
          <Text style={styles.msgTime}>{formatTime(item.created_at)}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 Booking #{bookingId} Chat</Text>
        <View style={[styles.dot, { backgroundColor: connected ? '#10B981' : '#EF4444' }]} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMessage}
        contentContainerStyle={styles.msgList}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor="#475569"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!text.trim()}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#F8FAFC' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  msgList: { paddingHorizontal: 16, paddingVertical: 12 },
  msgWrapper: { marginBottom: 10, maxWidth: '80%' },
  msgLeft: { alignSelf: 'flex-start' },
  msgRight: { alignSelf: 'flex-end' },
  msgSender: { fontSize: 11, color: '#64748B', marginBottom: 3, marginLeft: 4 },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { backgroundColor: '#F59E0B', borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: '#1E293B', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  bubbleTextMe: { color: '#0F172A', fontWeight: '600' },
  bubbleTextThem: { color: '#F8FAFC' },
  msgTime: { fontSize: 10, color: 'rgba(0,0,0,0.4)', marginTop: 4, textAlign: 'right' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#F8FAFC',
    maxHeight: 100,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { fontSize: 18, color: '#0F172A', fontWeight: '800' },
});
