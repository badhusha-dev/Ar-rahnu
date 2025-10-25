import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, TrendingUp } from "lucide-react";

interface GoldPrice {
  id: string;
  karat: string;
  buyPricePerGramMyr: string;
  sellPricePerGramMyr: string;
  source: string | null;
  updatedAt: string;
}

export default function GoldPricesMaster() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<GoldPrice | null>(null);
  const [formData, setFormData] = useState({
    karat: "",
    buyPricePerGramMyr: "",
    sellPricePerGramMyr: "",
    source: "",
  });

  const queryClient = useQueryClient();

  const { data: prices, isLoading } = useQuery<GoldPrice[]>({
    queryKey: ["/api/master/gold-prices"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/master/gold-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master/gold-prices"] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({ title: "Success", description: "Gold price created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await fetch(`/api/master/gold-prices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master/gold-prices"] });
      setEditingPrice(null);
      resetForm();
      toast({ title: "Success", description: "Gold price updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/master/gold-prices/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master/gold-prices"] });
      toast({ title: "Success", description: "Gold price deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      karat: "",
      buyPricePerGramMyr: "",
      sellPricePerGramMyr: "",
      source: "",
    });
  };

  const handleEdit = (price: GoldPrice) => {
    setEditingPrice(price);
    setFormData({
      karat: price.karat,
      buyPricePerGramMyr: price.buyPricePerGramMyr,
      sellPricePerGramMyr: price.sellPricePerGramMyr,
      source: price.source || "",
    });
  };

  const handleSubmit = () => {
    if (editingPrice) {
      updateMutation.mutate({ id: editingPrice.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <TrendingUp className="h-6 w-6" />
                Gold Prices Master
              </CardTitle>
              <CardDescription>
                Manage gold buy/sell prices by karat
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  resetForm();
                  setEditingPrice(null);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Price
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Gold Price</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="karat">Karat</Label>
                    <Input
                      id="karat"
                      value={formData.karat}
                      onChange={(e) => setFormData({ ...formData, karat: e.target.value })}
                      placeholder="999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="buy">Buy Price (MYR/gram)</Label>
                    <Input
                      id="buy"
                      type="number"
                      step="0.01"
                      value={formData.buyPricePerGramMyr}
                      onChange={(e) => setFormData({ ...formData, buyPricePerGramMyr: e.target.value })}
                      placeholder="320.50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sell">Sell Price (MYR/gram)</Label>
                    <Input
                      id="sell"
                      type="number"
                      step="0.01"
                      value={formData.sellPricePerGramMyr}
                      onChange={(e) => setFormData({ ...formData, sellPricePerGramMyr: e.target.value })}
                      placeholder="336.50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="source">Source</Label>
                    <Input
                      id="source"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      placeholder="Manual / API"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>Create Price</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Karat</TableHead>
                  <TableHead>Buy Price (MYR/g)</TableHead>
                  <TableHead>Sell Price (MYR/g)</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prices?.map((price) => (
                  <TableRow key={price.id}>
                    <TableCell className="font-medium">{price.karat}</TableCell>
                    <TableCell>RM {parseFloat(price.buyPricePerGramMyr).toFixed(2)}</TableCell>
                    <TableCell>RM {parseFloat(price.sellPricePerGramMyr).toFixed(2)}</TableCell>
                    <TableCell>{price.source || "-"}</TableCell>
                    <TableCell>{new Date(price.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Dialog open={editingPrice?.id === price.id} onOpenChange={(open) => {
                        if (!open) setEditingPrice(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(price)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Gold Price</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="edit-karat">Karat</Label>
                              <Input
                                id="edit-karat"
                                value={formData.karat}
                                onChange={(e) => setFormData({ ...formData, karat: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-buy">Buy Price (MYR/gram)</Label>
                              <Input
                                id="edit-buy"
                                type="number"
                                step="0.01"
                                value={formData.buyPricePerGramMyr}
                                onChange={(e) => setFormData({ ...formData, buyPricePerGramMyr: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-sell">Sell Price (MYR/gram)</Label>
                              <Input
                                id="edit-sell"
                                type="number"
                                step="0.01"
                                value={formData.sellPricePerGramMyr}
                                onChange={(e) => setFormData({ ...formData, sellPricePerGramMyr: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-source">Source</Label>
                              <Input
                                id="edit-source"
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingPrice(null)}>
                              Cancel
                            </Button>
                            <Button onClick={handleSubmit}>Update Price</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this price record?")) {
                            deleteMutation.mutate(price.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

