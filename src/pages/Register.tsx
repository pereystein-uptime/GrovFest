import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Passordet må være minst 6 tegn");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Konto opprettet!");
      navigate("/onboarding");
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
            <h2 className="text-lg font-semibold text-center">Opprett konto</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Fullt navn</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="Ola Nordmann" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="din@epost.no" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passord</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Minst 6 tegn" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Oppretter..." : "Opprett konto"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Har du allerede en konto?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Logg inn →</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
