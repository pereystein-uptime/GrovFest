import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <Bus className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Russebuss <span className="text-primary">OS</span>
          </h1>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <h2 className="text-lg font-semibold text-center">Logg inn</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="din@epost.no" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passord</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logger inn..." : "Logg inn"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm space-y-2">
          <p className="text-muted-foreground">
            Har du en invitasjonskode?{" "}
            <Link to="/join" className="text-primary font-medium hover:underline">Bli med i en gruppe →</Link>
          </p>
          <p className="text-muted-foreground">
            Ny bussjef?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">Opprett gruppe →</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
