import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { getContract } from '@/lib/web3';
import type { FIR } from '@/types/fir';
import { motion } from 'framer-motion';
import { Loader2, Clock, CheckCircle, MapPin, Calendar } from 'lucide-react';

interface FIRListProps {
  onStatusChange?: () => void;
}

export function FIRList({ onStatusChange }: FIRListProps) {
  const { toast } = useToast();
  const [firs, setFirs] = useState<FIR[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateData, setUpdateData] = useState({ id: 0, description: '', status: '' });

  const loadFIRs = async () => {
    try {
      const contract = await getContract();
      const data = await contract.getMyFIRs();
      
      if (!data || !Array.isArray(data)) {
        console.error('Invalid data format received:', data);
        setFirs([]);
        return;
      }

      const formattedData = data.map((fir: any) => ({
        id: Number(fir.id || 0),
        complainant: fir.complainant || '',
        title: fir.title || '',
        description: fir.description || '',
        location: fir.location || '',
        timestamp: Number(fir.timestamp || 0),
        isResolved: Boolean(fir.isResolved),
        status: fir.status || 'Pending',
      }));
      setFirs(formattedData.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error: any) {
      console.error('Error loading FIRs:', error);
      let errorMessage = 'Failed to load FIRs';
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Request was rejected. Please try again.';
      } else if (error.code === 'BAD_DATA') {
        errorMessage = 'No FIRs found for your account';
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setFirs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const contract = await getContract();
      const tx = await contract.updateFIR(
        updateData.id,
        updateData.description,
        updateData.status
      );
      await tx.wait();
      await loadFIRs();
      onStatusChange?.();
      toast({
        title: 'Success',
        description: 'FIR updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating FIR:', error);
      let errorMessage = 'Failed to update FIR';
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected. Please try again.';
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      const contract = await getContract();
      const tx = await contract.resolveFIR(id);
      await tx.wait();
      await loadFIRs();
      onStatusChange?.();
      toast({
        title: 'Success',
        description: 'FIR resolved successfully',
      });
    } catch (error: any) {
      console.error('Error resolving FIR:', error);
      let errorMessage = 'Failed to resolve FIR';
      if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected. Please try again.';
      }
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadFIRs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center mb-6">My FIRs</h2>
      {firs.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">
          No FIRs found. File a new FIR to get started.
        </div>
      ) : (
        <div className="grid gap-4">
          {firs.map((fir, index) => (
            <motion.div
              key={fir.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                    {fir.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full flex items-center gap-2 ${
                    fir.isResolved 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  }`}>
                    {fir.isResolved ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    {fir.status}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {fir.description}
                </p>
                
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {fir.location}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(fir.timestamp * 1000).toLocaleDateString()}
                  </span>
                </div>
                
                {!fir.isResolved && (
                  <div className="mt-4 space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          className="hover:bg-blue-50 dark:hover:bg-blue-900"
                          onClick={() => setUpdateData({
                            id: fir.id,
                            description: fir.description,
                            status: fir.status,
                          })}
                        >
                          Update
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update FIR</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Description
                            </label>
                            <Textarea
                              value={updateData.description}
                              onChange={(e) =>
                                setUpdateData({
                                  ...updateData,
                                  description: e.target.value,
                                })
                              }
                              className="min-h-[100px]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Status
                            </label>
                            <Input
                              value={updateData.status}
                              onChange={(e) =>
                                setUpdateData({
                                  ...updateData,
                                  status: e.target.value,
                                })
                              }
                            />
                          </div>
                          <Button
                            onClick={handleUpdate}
                            disabled={updating}
                            className="w-full"
                          >
                            {updating ? 'Updating...' : 'Update FIR'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="secondary"
                      onClick={() => handleResolve(fir.id)}
                      className="hover:bg-green-50 dark:hover:bg-green-900"
                    >
                      Resolve
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}