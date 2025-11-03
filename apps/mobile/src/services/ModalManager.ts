// src/services/ModalManager.ts
import {EventEmitter} from 'events';

export interface ModalState {
  visible: boolean;
  component: React.ComponentType<any> | null;
  props: any;
}

class ModalManager extends EventEmitter {
  private static instance: ModalManager;
  private MAX_LISTENERS = 10; // Giữ 15 tạm thời Lưu ý khi hết Emit thì không thể popup Global Modal được...
  private modalState: ModalState = {
    visible: false,
    component: null,
    props: {},
  };

  private constructor() {
    super();
    this.setMaxListeners(this.MAX_LISTENERS);
  }

  public static getInstance(): ModalManager {
    if (!ModalManager.instance) {
      ModalManager.instance = new ModalManager();
    }
    return ModalManager.instance;
  }

  public getState(): ModalState {
    return {...this.modalState};
  }

  public showModal(component: React.ComponentType<any>, props: any = {}): void {
    this.modalState = {
      visible: true,
      component,
      props: {
        ...props,
        key: props.key,
        onClose: () => {
          this.closeModal();
          if (props.onClose) props.onClose();
        },
      },
    };

    // Kiểm tra số lượng listener trước khi emit
    const listenerCount = this.listenerCount('stateChanged');
    
    if (listenerCount >= 15) {
    
    }

    this.emit('stateChanged', this.modalState);
  }

  public closeModal(): void {
    this.modalState = {
      ...this.modalState,
      visible: false,
    };

    const listenerCount = this.listenerCount('stateChanged');
    this.emit('stateChanged', this.modalState);

    setTimeout(() => {
      this.modalState = {
        visible: false,
        component: null,
        props: {},
      };
      this.emit('stateChanged', this.modalState);
    }, 300);
  }

  public subscribe(callback: (state: ModalState) => void): () => void {
    this.on('stateChanged', callback);
    return () => {
      this.off('stateChanged', callback);
    };
  }

  // Thêm phương thức để kiểm tra tất cả listener
  public debugListeners(): void {
    const events = this.eventNames();
    
    events.forEach(event => {
      const count = this.listenerCount(event);
    });
  }
}

export default ModalManager;
