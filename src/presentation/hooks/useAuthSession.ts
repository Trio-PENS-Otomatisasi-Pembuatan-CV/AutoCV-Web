import { useState, useEffect, useCallback } from "react";
import type { WorkflowStep } from "../components/organisms/StepSwitcherBar";

export interface UserSession {
  name: string;
  email: string;
  role?: string;
  signedInAt?: string;
}

interface UseAuthSessionOptions {
  onStepChange?: (step: WorkflowStep) => void;
}

export function useAuthSession(options?: UseAuthSessionOptions) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  // Initialize auth state from browser storage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const userStr = localStorage.getItem("autocv_user");
    if (userStr) {
      try {
        const parsed: UserSession = JSON.parse(userStr);
        setCurrentUser(parsed);
        setIsAuthenticated(true);
        options?.onStepChange?.("input");
        return;
      } catch {
        // Fall through to unauthenticated
      }
    }

    setIsAuthenticated(false);
    options?.onStepChange?.("login");
  }, []);

  const login = useCallback(
    (userData?: UserSession) => {
      const defaultUser: UserSession = {
        name: "John Doe",
        email: "john.doe@company.com",
        role: "Senior Fullstack Engineer",
      };

      const user = userData || defaultUser;
      if (typeof window !== "undefined") {
        const userStr = localStorage.getItem("autocv_user");
        if (userStr) {
          try {
            setCurrentUser(JSON.parse(userStr));
          } catch {
            setCurrentUser(user);
          }
        } else {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(user);
      }

      setIsAuthenticated(true);
      options?.onStepChange?.("input");
    },
    [options]
  );

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("autocv_user");
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    options?.onStepChange?.("login");
  }, [options]);

  return {
    isAuthenticated,
    currentUser,
    login,
    logout,
  };
}
