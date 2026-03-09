import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { PawPrint } from 'lucide-react';
import llAvatar from '@/assets/ll-avatar-transparent.png';
import { toast } from 'sonner';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password);
    if (error) {
      toast.error(error.message);
    } else if (isSignUp) {
      toast.success('Check your email to confirm your account! 🐕');
    }
    // Navigation happens automatically via useEffect when user state updates
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mb-4"
          >
            <img src={llAvatar} alt="LL" className="w-24 h-24 mx-auto" />
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-foreground">LL Walks</h1>
          <p className="text-muted-foreground mt-2 font-body">Track LL's daily walks</p>
        </div>

        <Card className="shadow-lg border-2 border-border">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-xl">
              {isSignUp ? 'Create Account' : 'Welcome Back!'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="rounded-xl h-12 text-base"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="rounded-xl h-12 text-base"
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl text-lg font-display font-semibold"
              >
                {loading ? '...' : isSignUp ? <span className="flex items-center gap-1">Sign Up <PawPrint className="w-5 h-5" style={{ color: '#5D4037' }} /></span> : <span className="flex items-center gap-1">Log In <PawPrint className="w-5 h-5" style={{ color: '#5D4037' }} /></span>}
              </Button>
            </form>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
            </button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
