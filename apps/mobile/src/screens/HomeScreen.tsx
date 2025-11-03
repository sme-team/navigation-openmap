import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';

// Khai báo kiểu cho props (nếu có)
interface HomeScreenProps {
  // Ví dụ: navigation prop thường được truyền từ React Navigation
  navigation?: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const handleButtonPress = (screenName: string) => {
    Alert.alert(
      'Navigation Demo',
      `Bạn đã bấm vào nút và sẽ chuyển đến màn hình: ${screenName}`
    );
    // Trong ứng dụng thực tế, bạn sẽ dùng:
    // navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Chào mừng đến với App Demo! 🚀</Text>
        <Text style={styles.subtitle}>
          Đây là màn hình chính (HomeScreen)
        </Text>

        {/* --- Phần Nội dung Chính --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Các Tính năng Cơ bản</Text>
          <Text style={styles.cardText}>
            Demo này sử dụng các component cơ bản như Text, View, ScrollView, và TouchableOpacity.
          </Text>
        </View>

        {/* --- Các Nút Demo --- */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleButtonPress('ProfileScreen')}>
          <Text style={styles.buttonText}>Đến Màn Hình Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => handleButtonPress('SettingsScreen')}>
          <Text style={styles.buttonText}>Cài Đặt ⚙️</Text>
        </TouchableOpacity>

        {/* --- Thông tin thêm --- */}
        <Text style={styles.footerText}>
          React Native Demo App - Phiên bản 1.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

// Định nghĩa Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Màu nền nhẹ cho toàn bộ màn hình
  },
  container: {
    flexGrow: 1, // Cho phép ScrollView cuộn
    padding: 20,
    alignItems: 'center', // Căn giữa các item theo chiều ngang
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#4a90e2',
  },
  cardText: {
    fontSize: 14,
    color: '#555',
  },
  button: {
    backgroundColor: '#4a90e2', // Màu xanh dương chính
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginVertical: 10,
  },
  secondaryButton: {
    backgroundColor: '#5cb85c', // Màu xanh lá cây
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    marginTop: 40,
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
  },
});

// export default HomeScreen;