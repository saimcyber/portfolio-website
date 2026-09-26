import { lazy, Suspense, useState, Component, type PropsWithChildren } from "react";
import "./App.css";

const ClusterModel = lazy(() => import("./components/Cluster"));
import MainContainer from "./components/MainContainer";
import { LoadingProvider } from "./context/LoadingProvider";

const App = () => {
  const [showScene, setShowScene] = useState(false);
  return (
    <>
      <LoadingProvider>
          <MainContainer sceneEnabled={showScene} onEnableScene={() => setShowScene(true)}>
            <SceneBoundary>
            <Suspense fallback={null}>
              {showScene && <ClusterModel />}
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
