import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Loading from "../components/Loading";
import { getProgressMachine, peekProgressMachine } from "./loadingProgress";

interface LoadingType {
  isLoading: boolean;
  setIsLoading: (state: boolean) => void;
  setLoading: (percent: number) => void;
}

export const LoadingContext = createContext<LoadingType | null>(null);

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(0);

  // Start the eased climb on first paint, not when the lazy ~950KB 3D chunk
  // finishes parsing (where it used to live). The climb is a fixed curve with
  // no dependency on scene readiness - Scene still calls `loaded()` on this
  // same singleton to finish to 100% and reveal the page.
  useEffect(() => {
    getProgressMachine(setLoading);

    // Last-resort failsafe: if the Cluster chunk never downloads (offline mid
    // load, a hard network failure) Scene's own ready gate never fires. Drive
    // the bar to 100% anyway so Loading.tsx runs its normal hand-off instead
    // of the loader sitting at ~92% forever. Scene's happy path completes well
    // under this, so it only ever fires on a genuine failure.
    const failsafe = window.setTimeout(() => {
      peekProgressMachine()?.clear();
    }, 12000);
    return () => window.clearTimeout(failsafe);
  }, []);

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
