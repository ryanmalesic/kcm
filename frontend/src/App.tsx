import { useAppContext } from "./context/AppContext";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";

function App() {
  const { user } = useAppContext();

  return (
    <div className="flex flex-col max-h-screen min-h-screen overflow-hidden text-gray-900 max-w-sxreen min-w-screen">
      {user && <Dashboard />}
      {!user && <SignIn />}
    </div>
  );
}

export default App;
