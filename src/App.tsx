import { useEffect, useState } from 'react';
import { FileText, FilePlus, Shield, Building2, Scale, Users, Bell, ChevronRight, Lock, BadgeCheck, Activity, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FIRForm } from '@/components/FIRForm';
import { FIRList } from '@/components/FIRList';
import { getWeb3Provider, getContract } from '@/lib/web3';
import { Toaster } from '@/components/ui/toaster';
import { motion, AnimatePresence } from 'framer-motion';

interface Stats {
  total: number;
  pending: number;
  resolved: number;
  todayFiled: number;
}

function App() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, resolved: 0, todayFiled: 0 });

  const loadStats = async () => {
    try {
      const contract = await getContract();
      const firs = await contract.getMyFIRs();
      
      if (!firs || !Array.isArray(firs)) return;

      const today = new Date().setHours(0, 0, 0, 0);
      const stats = firs.reduce((acc, fir) => {
        acc.total++;
        if (fir.isResolved) acc.resolved++;
        else acc.pending++;
        
        const firDate = new Date(Number(fir.timestamp) * 1000).setHours(0, 0, 0, 0);
        if (firDate === today) acc.todayFiled++;
        
        return acc;
      }, { total: 0, pending: 0, resolved: 0, todayFiled: 0 });

      setStats(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const connectWallet = async () => {
    setConnecting(true);
    try {
      await getWeb3Provider();
      setConnected(true);
      loadStats();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setStats({ total: 0, pending: 0, resolved: 0, todayFiled: 0 });
  };

  const handleLogoClick = () => {
    if (connected) {
      handleDisconnect();
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (window.ethereum && window.ethereum.selectedAddress) {
          setConnected(true);
          loadStats();
        }
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
      }
    };
    checkConnection();
  }, []);

  const NavHeader = () => (
    <nav className="fixed top-0 left-0 right-0 border-b bg-white/50 backdrop-blur-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Telangana_Police_Logo.png/640px-Telangana_Police_Logo.png"
              alt="Telangana Police Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-bold text-xl">Telangana State Police</span>
          </button>
          <div className="flex items-center gap-4">
            {connected && (
              <Button
                variant="ghost"
                onClick={handleDisconnect}
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                Disconnect
              </Button>
            )}
            <a href="tel:100" className="text-sm font-semibold text-blue-600">
              Emergency: 100
            </a>
          </div>
        </div>
      </div>
    </nav>
  );

  if (!connected) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
        <NavHeader />

        <main className="pt-16">
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-8"
              >
                <img
                  src=""
                  alt="Telangana Police Logo"
                  className="w-32 h-32 object-contain animate-pulse"
                />
              </motion.div>
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"
              >
                Hyderabad Police FIR System
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto px-4"
              >
                A secure, transparent, and efficient way to file and track your First Information Reports using blockchain technology
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button 
                  onClick={connectWallet} 
                  disabled={connecting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-4 md:py-6 rounded-lg text-base md:text-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  {connecting ? 'Connecting...' : (
                    <>
                      Connect Wallet
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Stats Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {[
                  { icon: <Activity className="w-6 h-6" />, label: "Active Cases", value: "24/7" },
                  { icon: <Users className="w-6 h-6" />, label: "Police Stations", value: "50+" },
                  { icon: <Clock className="w-6 h-6" />, label: "Response Time", value: "15min" },
                  { icon: <BadgeCheck className="w-6 h-6" />, label: "Resolution Rate", value: "98%" }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="text-center p-4"
                  >
                    <div className="flex justify-center mb-2">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                        {stat.icon}
                      </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
      <NavHeader />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 pt-24"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            FIR Management Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            File and manage your FIRs securely with blockchain verification
          </p>
        </div>

        {/* Real-time Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Total FIRs", value: stats.total, icon: <FileText className="w-5 h-5" /> },
            { label: "Pending", value: stats.pending, icon: <Clock className="w-5 h-5" /> },
            { label: "Resolved", value: stats.resolved, icon: <BadgeCheck className="w-5 h-5" /> },
            { label: "Filed Today", value: stats.todayFiled, icon: <Activity className="w-5 h-5" /> }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm md:text-base text-gray-600 dark:text-gray-400">{stat.label}</span>
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  {stat.icon}
                </div>
              </div>
              <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stat.value}
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="mb-8 w-full justify-center">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <FilePlus className="w-4 h-4" />
              File FIR
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              My FIRs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="file">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FIRForm onSuccess={loadStats} />
            </motion.div>
          </TabsContent>
          
          <TabsContent value="list">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FIRList onStatusChange={loadStats} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
      <Toaster />
    </div>
  );
}

export default App;