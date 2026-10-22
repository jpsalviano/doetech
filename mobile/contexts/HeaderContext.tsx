import React, { createContext, ReactNode, useContext, useState } from "react";

interface HeaderContextData {
  title: string;
  setTitle: (title: string) => void;
}

const HeaderContext = createContext<HeaderContextData | null>(null);

interface HeaderProviderProps {
  children: ReactNode;
}

export function HeaderProvider({ children }: HeaderProviderProps) {
  const [title, setTitle] = useState("DoeTech");

  return (
    <HeaderContext.Provider value={{ title, setTitle }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error("useHeader deve ser usado em HeaderProvider");
  }
  return context;
}
