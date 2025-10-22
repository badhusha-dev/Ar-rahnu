import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Coins } from "lucide-react";
import { Link } from "wouter";
import type { Customer, Branch } from "@shared/schema";
import { z } from "zod";

const formSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  branchId: z.string().min(1, "Branch is required"),
  
  // Gold item details
  goldDescription: z.string().min(1, "Gold description is required"),
  karat: z.enum(["999", "916", "900", "875", "750", "585"]),
  weightGrams: z.string().min(1, "Weight is required"),
  
  // Loan details
  marginPercentage: z.string().min(1, "Margin percentage is required"),
  tenureMonths: z.string().min(1, "Tenure is required"),
  monthlyFeeMyr: z.string().min(1, "Monthly fee is required"),
  
  // Vault details
  vaultSection: z.string().min(1, "Vault section is required"),
  vaultPosition: z.string().min(1, "Vault position is required"),
  
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewTransaction() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: branches } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

  const { data: goldPrices } = useQuery<{ prices: Array<{ karat: string; pricePerGramMyr: number }> }>({
    queryKey: ["/api/gold-prices"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      branchId: "",
      goldDescription: "",
      karat: "916",
      weightGrams: "",
      marginPercentage: "75",
      tenureMonths: "6",
      monthlyFeeMyr: "",
      vaultSection: "A",
      vaultPosition: "",
      notes: "",
    },
  });

  const watchKarat = form.watch("karat");
  const watchWeight = form.watch("weightGrams");
  const watchMargin = form.watch("marginPercentage");

  // Calculate market value and loan amount
  const selectedPrice = goldPrices?.prices?.find(p => p.karat === watchKarat);
  const marketValue = selectedPrice && watchWeight 
    ? selectedPrice.pricePerGramMyr * parseFloat(watchWeight || "0")
    : 0;
  const loanAmount = marketValue && watchMargin
    ? marketValue * (parseFloat(watchMargin || "0") / 100)
    : 0;

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      return await apiRequest("POST", "/api/transactions", {
        ...data,
        weightGrams: parseFloat(data.weightGrams),
        marginPercentage: parseFloat(data.marginPercentage),
        tenureMonths: parseInt(data.tenureMonths),
        monthlyFeeMyr: parseFloat(data.monthlyFeeMyr),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Pawn transaction created successfully",
      });
      navigate("/loans");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create transaction",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data);
  };

  const nextStep = async () => {
    const fields = step === 1 ? ["customerId", "branchId"] : step === 2 ? ["goldDescription", "karat", "weightGrams"] : [];
    const isValid = await form.trigger(fields as any);
    if (isValid) {
      setStep(step + 1);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4" data-testid="button-back">
          <Link href="/loans">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Loan Ledger
          </Link>
        </Button>
        <h1 className="text-4xl font-heading font-semibold text-foreground" data-testid="heading-new-transaction">
          New Pawn Transaction
        </h1>
        <p className="text-muted-foreground mt-1">Create a new Rahn contract (Islamic pledge)</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              s <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {s}
            </div>
            {s < 3 && (
              <div className={`w-12 h-0.5 transition-colors ${s < step ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Customer Selection */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Customer & Branch</CardTitle>
                <CardDescription>Select the customer and branch for this transaction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-customer">
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers?.filter(c => c.status === "active").map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.fullName} - {customer.icNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Only active customers are shown</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-branch">
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches?.filter(b => b.isActive).map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name} ({branch.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button type="button" onClick={nextStep} data-testid="button-next-step-1">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Gold Valuation */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Gold Valuation</CardTitle>
                <CardDescription>Enter gold item details and calculate market value</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="goldDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gold Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., Gold necklace with pendant, 22K" 
                          className="resize-none" 
                          rows={3} 
                          {...field}
                          data-testid="textarea-gold-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="karat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Karat *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-karat">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="999">999 (24K - Purest)</SelectItem>
                            <SelectItem value="916">916 (22K - Common)</SelectItem>
                            <SelectItem value="900">900 (21.6K)</SelectItem>
                            <SelectItem value="875">875 (21K)</SelectItem>
                            <SelectItem value="750">750 (18K)</SelectItem>
                            <SelectItem value="585">585 (14K)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weightGrams"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (grams) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.001" 
                            placeholder="e.g., 25.500" 
                            {...field} 
                            data-testid="input-weight"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Live Price Display */}
                {selectedPrice && (
                  <div className="p-4 bg-accent/10 rounded-lg border border-accent/20 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current Price ({watchKarat}):</span>
                      <span className="font-bold tabular-nums">RM {selectedPrice.pricePerGramMyr.toFixed(2)}/g</span>
                    </div>
                    {marketValue > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Market Value:</span>
                          <span className="text-2xl font-bold tabular-nums text-accent" data-testid="text-market-value">
                            RM {marketValue.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Estimated Loan ({watchMargin}%):</span>
                          <span className="text-xl font-bold tabular-nums text-primary" data-testid="text-loan-amount">
                            RM {loanAmount.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} data-testid="button-previous-step-2">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                  </Button>
                  <Button type="button" onClick={nextStep} data-testid="button-next-step-2">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Loan Terms & Vault */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Loan Terms & Vault Storage</CardTitle>
                <CardDescription>Configure loan parameters and vault location</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="marginPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Margin (%) *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-margin">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="70">70% - Standard</SelectItem>
                            <SelectItem value="75">75% - Common</SelectItem>
                            <SelectItem value="80">80% - Maximum</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Percentage of market value to loan</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tenureMonths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tenure (months) *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-tenure">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="3">3 months</SelectItem>
                            <SelectItem value="6">6 months</SelectItem>
                            <SelectItem value="9">9 months</SelectItem>
                            <SelectItem value="12">12 months</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monthlyFeeMyr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Fee (Ujrah) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="e.g., 50.00" 
                            {...field} 
                            data-testid="input-monthly-fee"
                          />
                        </FormControl>
                        <FormDescription>Safekeeping fee per month (MYR)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Vault Storage Location</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="vaultSection"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vault Section *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-vault-section">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A">Section A</SelectItem>
                              <SelectItem value="B">Section B</SelectItem>
                              <SelectItem value="C">Section C</SelectItem>
                              <SelectItem value="D">Section D</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vaultPosition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position/Slot *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., A-12 or B-05" {...field} data-testid="input-vault-position" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional notes" 
                          className="resize-none" 
                          rows={3} 
                          {...field} 
                          data-testid="textarea-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} data-testid="button-previous-step-3">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit">
                    <Coins className="w-4 h-4 mr-2" />
                    {createMutation.isPending ? "Creating..." : "Create Transaction"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
}
