import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface MemberInfo {
  group_id: string;
  role: string;
  name: string;
  role_id: string | null;
  role_name: string | null;
  permission_level: string;
  role_color: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  memberInfo: MemberInfo | null;
  signOut: () => Promise<void>;
  refreshMemberInfo: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  memberInfo: null,
  signOut: async () => {},
  refreshMemberInfo: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchMemberInfo(session.user.id), 0);
      } else {
        setMemberInfo(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchMemberInfo(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchMemberInfo(userId: string) {
    const { data } = await supabase
      .from("members")
      .select("group_id, role, name, role_id, roles(name, permission_level, color)")
      .eq("user_id", userId)
      .is("removed_at", null)
      .maybeSingle();
    
    if (data) {
      const roleData = data.roles as any;
      setMemberInfo({
        group_id: data.group_id,
        role: data.role,
        name: data.name,
        role_id: data.role_id,
        role_name: roleData?.name ?? data.role,
        permission_level: roleData?.permission_level ?? (data.role === "bussjef" ? "admin" : "member"),
        role_color: roleData?.color ?? "gray",
      });
    } else {
      setMemberInfo(null);
    }
    setLoading(false);
  }

  function refreshMemberInfo() {
    if (user) fetchMemberInfo(user.id);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setMemberInfo(null);
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, memberInfo, signOut, refreshMemberInfo }}>
      {children}
    </AuthContext.Provider>
  );
}
