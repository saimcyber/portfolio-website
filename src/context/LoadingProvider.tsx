import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import Loading from "../components/Loading";

interface LoadingType {
  isLoading: boolean;
  setIsLoading: (state: boolean) => void;
  setLoading: (percent: number) => void;
}

export const LoadingContext = createContext<LoadingType | null>(null);

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(0);

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
      {isLoading && <Loading percent={loading} />}
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
