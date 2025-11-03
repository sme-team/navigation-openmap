import React, {useEffect, useCallback, useMemo} from 'react';
import {Modal, BackHandler, View} from 'react-native';
import {Provider} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {SafeAreaView} from 'react-native';
import {I18nextProvider} from 'react-i18next';
import i18n from './src/i18n';

import {AppNavigator} from '@/navigation/AppNavigator';
import {ThemeProvider} from '@/styles/ThemeContext';
import {store} from './src/store';
import {NavigationService} from '@/navigation/NavigationService';
import {useModal} from '@/hooks/useModal';
import ModalManager from '@/services/ModalManager';

// Tách GlobalModal thành component riêng với ModalManager
const GlobalModal: React.FC = React.memo(() => {
  const modalState = useModal();

  const renderModalContent = useCallback(() => {
    if (!modalState.component) return null;
    const ModalComponent = modalState.component;

    const {key, ...restProps} = modalState.props;

    return (
      <ThemeProvider>
        <Provider store={store}>
          <I18nextProvider i18n={i18n}>
            <ModalComponent key={key} {...restProps} />
          </I18nextProvider>
        </Provider>
      </ThemeProvider>
    );
  }, [modalState.component, modalState.props]);

  const handleClose = useCallback(() => {
    ModalManager.getInstance().closeModal();
  }, []);

  return (
    <Modal
      visible={modalState.visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent={true}>
      <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)'}}>
        {renderModalContent()}
      </View>
    </Modal>
  );
});

GlobalModal.displayName = 'GlobalModal';

function App() {
  // Setup NavigationService và BackHandler
  useEffect(() => {
    const backAction = () => {
      const modalManager = ModalManager.getInstance();
      const currentState = modalManager.getState();

      if (currentState.visible) {
        modalManager.closeModal();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  // Memoize toàn bộ app content để tránh re-render
  const appContent = useMemo(() => {
    return (
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <SafeAreaView style={{flex: 1}}>
            <NavigationContainer
              ref={ref => {
                NavigationService.setNavigationRef(ref);
              }}>
              <Provider store={store}>
                <AppNavigator />
              </Provider>
            </NavigationContainer>
          </SafeAreaView>
          <Toast />
        </ThemeProvider>
      </I18nextProvider>
    );
  }, []); // Không có dependencies - chỉ tạo một lần

  return (
    <>
      {appContent}
      <GlobalModal />
    </>
  );
}

export default App;
