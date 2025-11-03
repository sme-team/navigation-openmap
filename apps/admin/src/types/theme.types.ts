// Theme Types
export type ThemeColor =
  | "blue"
  | "purple"
  | "green"
  | "red"
  | "orange"
  | "teal";

export interface ThemeConfig {
  name: string;
  colors: {
    primary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    secondary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
  };
}
