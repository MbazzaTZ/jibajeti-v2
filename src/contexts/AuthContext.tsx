import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    fullName: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (password: string) => Promise<{ success: boolean; message: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            fullName: session.user.user_metadata.full_name || session.user.email?.split("@")[0] || "User",
          });
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          fullName: session.user.user_metadata.full_name || session.user.email?.split("@")[0] || "User",
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Attempting login with email:", email);
      
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error.message);
        return false;
      }
      
      console.log("Login successful:", data);
      return true;
    } catch (err) {
      console.error("Login exception:", err);
      return false;
    }
  };

  const register = async (userData: {
    fullName: string;
    username: string;
    email: string;
    password: string;
  }): Promise<boolean> => {
    try {
      console.log("Attempting registration with email:", userData.email);
      
      const { error, data } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            username: userData.username,
          },
        },
      });
      
      if (error) {
        console.error("Registration error:", error.message);
        return false;
      }
      
      console.log("Registration successful:", data);
      return true;
    } catch (err) {
      console.error("Registration exception:", err);
      return false;
    }
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log("Requesting password reset for:", email);

      if (!email.trim()) {
        return {
          success: false,
          message: "Please enter your email address",
        };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error("Password reset error:", error.message);
        return {
          success: false,
          message: error.message || "Failed to send reset email. Please try again.",
        };
      }

      console.log("Password reset email sent successfully");
      return {
        success: true,
        message: "Password reset link has been sent to your email. Please check your inbox and follow the instructions.",
      };
    } catch (err) {
      console.error("Password reset exception:", err);
      return {
        success: false,
        message: "An error occurred. Please try again later.",
      };
    }
  };

  const resetPassword = async (newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log("Resetting password for current user");

      if (!newPassword || newPassword.length < 6) {
        return {
          success: false,
          message: "Password must be at least 6 characters long",
        };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("Password update error:", error.message);
        return {
          success: false,
          message: error.message || "Failed to update password. Please try again.",
        };
      }

      console.log("Password updated successfully");
      return {
        success: true,
        message: "Your password has been updated successfully.",
      };
    } catch (err) {
      console.error("Password update exception:", err);
      return {
        success: false,
        message: "An error occurred. Please try again later.",
      };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      console.log("Logout successful");
      setUser(null);
    } catch (err) {
      console.error("Logout exception:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        requestPasswordReset,
        resetPassword,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
