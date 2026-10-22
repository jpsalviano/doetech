import { useEffect } from "react";
import { useHeader } from "../contexts/HeaderContext";

export function useScreenTitle(title: string) {
  const { setTitle } = useHeader();
  
  useEffect(() => {
    setTitle(title);
    return () => setTitle("DoeTech");
  }, [title, setTitle]);
}
