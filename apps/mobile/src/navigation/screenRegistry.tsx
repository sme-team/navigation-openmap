import React from 'react';

// Type cho screen registry
export interface ScreenInfo {
  component: React.ComponentType<any>;
  props?: any;
}

// Registry chứa tất cả các màn hình có thể load trong nội dung
// kiểu navigationType:'internal', trong menuConfig nhé
export const screenRegistry: Record<string, ScreenInfo> = {};

// Hàm helper để kiểm tra màn hình có tồn tại không
export const isScreenRegistered = (screenName: string): boolean => {
  return screenName in screenRegistry;
};

// Hàm helper để lấy component của màn hình
export const getScreenComponent = (
  screenName: string,
): React.ComponentType<any> | null => {
  const screenInfo = screenRegistry[screenName];
  return screenInfo ? screenInfo.component : null;
};

// Hàm helper để lấy props của màn hình
export const getScreenProps = (screenName: string): any => {
  const screenInfo = screenRegistry[screenName];
  return screenInfo ? screenInfo.props : {};
};
