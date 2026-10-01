import { lazy, Suspense, useEffect, useState, Component, type PropsWithChildren } from "react";
import "./App.css";

const ClusterModel = lazy(() => import("./components/Cluster"));
import MainContainer from "./components/MainContainer";
import { LoadingProvider } from "./context/LoadingProvider";

const App = () => {
  const [showScene, setShowScene] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(min-width: 1025px) and (prefers-reduced-motion: no-preference)");
    let timer: number;
    const update = () => {
      window.clearTimeout(timer);
      setSceneReady(false);
      setShowScene(false);
      if (preference.matches) timer = window.setTimeout(() => setShowScene(true), 850);
    };
    update();
    preference.addEventListener("change", update);
    return () => { window.clearTimeout(timer); preference.removeEventListener("change", update); };
  }, []);
  return (
    <>
      <LoadingProvider>
          <MainContainer sceneEnabled={showScene && sceneReady} onEnableScene={() => { setSceneReady(false); setShowScene((enabled) => !enabled); }}>
            <SceneBoundary>
            <Suspense fallback={null}>
              {showScene && <ClusterModel onReady={() => setSceneReady(true)} />}
            </Suspense>
            </SceneBoundary>
          </MainContainer>
      </LoadingProvider>
    </>
  );
};

class SceneBoundary extends Component<PropsWithChildren, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

export default App;
