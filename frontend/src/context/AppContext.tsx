import { Auth, CognitoUser } from "@aws-amplify/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { PropsWithChildren } from "react";

interface AppContextState {
  error: string | null;
  loading: boolean;
  user: CognitoUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const emptyAppContextState: AppContextState = {
  error: null,
  loading: false,
  user: null,
  signIn: async (email: string, password: string) => {},
  signOut: async () => {},
};

export const AppContext = createContext<AppContextState>(emptyAppContextState);

export function useAppContext() {
  return useContext(AppContext);
}

export const AppContextProvider: React.FC<PropsWithChildren> = (props) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<CognitoUser | null>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  async function fetchCurrentUser() {
    setLoading(true);

    try {
      const user = await Auth.currentAuthenticatedUser();
      setError(null);
      setUser(user);
    } catch (err) {
      setError((err as Error).message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);

    try {
      const user = await Auth.signIn(email, password);
      setError(null);
      setUser(user);
    } catch (err) {
      setError((err as Error).message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);

    try {
      await Auth.signOut();
      setError(null);
      setUser(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AppContext.Provider value={{ error, loading, user, signIn, signOut }}>
      {props.children}
    </AppContext.Provider>
  );
};
