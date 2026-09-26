import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";



interface LoadingType {
  isLoading: boolean;
  setIsLoading: (state: boolean) => void;
  setLoading: (percent: number) => void;
}

export const LoadingContext = createContext<LoadingType | null>(null);

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLoading] = useState(0);

  // Content must never wait for the decorative scene or a progress timer.
  useEffect(() => { setIsLoading(false); }, []);

  // `setIsLoading`/`setLoading` are stable, so this only changes when the gate
  // itself flips - previously a new object every render, which re-rendered
  // every consumer (including the 3D Scene) on each progress tick. The
  // `useEffect(() => {}, [loading])` that used to sit here did nothing at all.
  const value = useMemo<LoadingType>(
    () => ({ isLoading, setIsLoading, setLoading }),
    [isLoading]
  );

  return (
    <LoadingContext.Provider value={value}>

      <main className="main-body">{children}</main>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
