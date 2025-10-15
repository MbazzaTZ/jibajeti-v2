import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { useDualStorage } from "./useDualStorage";

export function useDarkMode() {
  const systemColorScheme = useColorScheme();
  const [darkMode, setDarkMode] = useDualStorage("jibajeti_dark_mode", systemColorScheme === "dark");

  useEffect(() => {
    // You can add dark mode logic here for React Native
    // For example, changing status bar style, etc.
  }, [darkMode]);

  return [darkMode, setDarkMode] as const;
}
