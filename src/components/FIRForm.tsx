import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { getContract } from '@/lib/web3';
import type { NewFIR } from '@/types/fir';
import { motion } from 'framer-motion';
import { FileText, MapPin } from 'lucide-react';

interface FIRFormProps {
  onSuccess?: () => void;
}

export function FIRForm({ onSuccess }: FIRFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NewFIR>({
    title: '',
    description: '',
    location: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const contract = await getContract();
      const tx = await contract.fileFIR(
        formData.title,
        formData.description,
        formData.location
      );
      await tx.wait();

      toast({
        title: 'Success',
        description: 'FIR filed successfully with Hyderabad Police',
      });

      setFormData({ title: '', description: '', location: '' });
      onSuccess?.();
    } catch (error) {
      console.error('Error filing FIR:', error);
      toast({
        title: 'Error',
        description: 'Failed to file FIR',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 max-w-2xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-6">
          <FileText className="w-12 h-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold">File New FIR</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Submit your complaint to Hyderabad City Police
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-medium mb-2">Complaint Title</label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="w-full"
              placeholder="Brief title of your complaint"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-medium mb-2">Detailed Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              className="min-h-[150px]"
              placeholder="Provide detailed information about the incident"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-medium mb-2">
              <MapPin className="w-4 h-4 inline-block mr-1" />
              Nearest Police Station
            </label>
            <select
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              required
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
            >
              <option value="">Select Police Station</option>
              {[
                'Abids Police Station',
                'Banjara Hills Police Station',
                'Charminar Police Station',
                'Jubilee Hills Police Station',
                'Madhapur Police Station',
                'Panjagutta Police Station',
                'Secunderabad Police Station',
              ].map((station) => (
                <option key={station} value={station}>
                  {station}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-4"
          >
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Filing FIR...' : 'Submit FIR'}
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              By submitting this FIR, you confirm that all information provided is true and accurate
            </p>
          </motion.div>
        </form>
      </motion.div>
    </Card>
  );
}