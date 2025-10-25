import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { SignaturePad } from '../components/SignaturePad';
import { Vault, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function VaultApproval() {
  const { user } = useAuth();
  const [step, setStep] = useState<'scan' | 'approver1' | 'approver2' | 'complete'>('scan');
  const [barcode, setBarcode] = useState('');
  const [loanId, setLoanId] = useState('');
  const [location, setLocation] = useState('');
  const [approver1, setApprover1] = useState({
    id: '',
    signature: '',
  });
  const [approver2, setApprover2] = useState({
    id: '',
    signature: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApprover1Signature = (signature: string) => {
    setApprover1({ ...approver1, signature });
    setStep('approver2');
  };

  const handleApprover2Signature = (signature: string) => {
    setApprover2({ ...approver2, signature });
    submitVaultIn(signature);
  };

  const submitVaultIn = async (signature2: string) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/rahnu/vault/vault-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          loanId,
          barcode,
          location,
          approver1Id: approver1.id,
          approver2Id: user?.userId,
          signature1: approver1.signature,
          signature2: signature2,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to vault item');
      }

      setStep('complete');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Vault className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Vault IN - Dual Approval</h1>
            <p className="text-sm text-muted-foreground">
              Secure pledged items with two-person verification
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {['scan', 'approver1', 'approver2', 'complete'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === s
                    ? 'bg-primary text-primary-foreground'
                    : i < ['scan', 'approver1', 'approver2', 'complete'].indexOf(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i + 1}
              </div>
              {i < 3 && <div className="w-12 h-0.5 bg-muted mx-2" />}
            </div>
          ))}
        </div>

        {error && (
          <Card className="p-4 mb-6 bg-destructive/10 border-destructive">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          </Card>
        )}

        {/* Step 1: Scan Item */}
        {step === 'scan' && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Scan Item Details</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="loanId">Loan ID</Label>
                <Input
                  id="loanId"
                  value={loanId}
                  onChange={(e) => setLoanId(e.target.value)}
                  placeholder="Enter loan ID"
                />
              </div>
              <div>
                <Label htmlFor="barcode">Barcode / RFID</Label>
                <Input
                  id="barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Scan or enter barcode"
                />
              </div>
              <div>
                <Label htmlFor="location">Vault Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Vault A-1"
                />
              </div>
              <Button
                onClick={() => setStep('approver1')}
                disabled={!loanId || !barcode || !location}
                className="w-full"
              >
                Continue to Approval
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: First Approver */}
        {step === 'approver1' && (
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">First Approver</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="approver1Id">Approver 1 ID</Label>
                  <Input
                    id="approver1Id"
                    value={approver1.id}
                    onChange={(e) => setApprover1({ ...approver1, id: e.target.value })}
                    placeholder="Enter staff ID"
                  />
                </div>
              </div>
            </Card>
            <SignaturePad
              label="Approver 1 Signature"
              onSave={handleApprover1Signature}
              onCancel={() => setStep('scan')}
            />
          </div>
        )}

        {/* Step 3: Second Approver */}
        {step === 'approver2' && (
          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Second Approver</h2>
              <div className="space-y-4">
                <div>
                  <Label>Approver 2</Label>
                  <Input value={user?.email || ''} disabled />
                  <p className="text-xs text-muted-foreground mt-1">
                    You are logged in as approver 2
                  </p>
                </div>
              </div>
            </Card>
            <SignaturePad
              label="Approver 2 Signature"
              onSave={handleApprover2Signature}
              onCancel={() => setStep('approver1')}
            />
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && (
          <Card className="p-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Item Secured!</h2>
            <p className="text-muted-foreground mb-6">
              The item has been securely placed in the vault with dual approval.
            </p>
            <Button onClick={() => window.location.reload()}>
              Vault Another Item
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

