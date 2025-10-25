import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Users as UsersIcon, Pencil, UserCheck, UserX } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: "customer" | "teller" | "manager" | "admin";
  scope: "rahnu" | "bse" | "both";
  branchId: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function UsersMaster() {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    role: "teller" as User["role"],
    scope: "bse" as User["scope"],
    isActive: true,
  });

  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/master/users"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/master/users/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master/users"] });
      toast({ title: "Success", description: "User status updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role, scope }: { id: string; role: string; scope: string }) => {
      const res = await fetch(`/api/master/users/${id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, scope }),
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master/users"] });
      setEditingUser(null);
      toast({ title: "Success", description: "User role updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      role: user.role,
      scope: user.scope,
      isActive: user.isActive,
    });
  };

  const handleSubmit = () => {
    if (editingUser) {
      updateRoleMutation.mutate({
        id: editingUser.id,
        role: formData.role,
        scope: formData.scope,
      });
    }
  };

  const toggleStatus = (user: User) => {
    updateStatusMutation.mutate({
      id: user.id,
      isActive: !user.isActive,
    });
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: "bg-purple-100 text-purple-800",
      manager: "bg-blue-100 text-blue-800",
      teller: "bg-green-100 text-green-800",
      customer: "bg-gray-100 text-gray-800",
    };
    return colors[role as keyof typeof colors] || colors.customer;
  };

  const getScopeBadgeColor = (scope: string) => {
    const colors = {
      both: "bg-purple-100 text-purple-800",
      rahnu: "bg-yellow-100 text-yellow-800",
      bse: "bg-green-100 text-green-800",
    };
    return colors[scope as keyof typeof colors] || colors.bse;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <UsersIcon className="h-6 w-6" />
                Users Master
              </CardTitle>
              <CardDescription>
                Manage system users, roles, and access permissions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getScopeBadgeColor(user.scope)}`}>
                        {user.scope}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => {
                        if (!open) setEditingUser(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User Role & Scope</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>User</Label>
                              <div className="p-2 bg-gray-50 rounded">
                                <div className="font-medium">{user.firstName} {user.lastName}</div>
                                <div className="text-sm text-gray-600">{user.email}</div>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="role">Role</Label>
                              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as User["role"] })}>
                                <SelectTrigger id="role">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="manager">Manager</SelectItem>
                                  <SelectItem value="teller">Teller</SelectItem>
                                  <SelectItem value="customer">Customer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="scope">Scope</Label>
                              <Select value={formData.scope} onValueChange={(value) => setFormData({ ...formData, scope: value as User["scope"] })}>
                                <SelectTrigger id="scope">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="both">Both (Rahnu + BSE)</SelectItem>
                                  <SelectItem value="rahnu">Ar-Rahnu Only</SelectItem>
                                  <SelectItem value="bse">BSE Only</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingUser(null)}>
                              Cancel
                            </Button>
                            <Button onClick={handleSubmit}>Update User</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(user)}
                        title={user.isActive ? "Deactivate user" : "Activate user"}
                      >
                        {user.isActive ? (
                          <UserX className="h-4 w-4 text-red-500" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-green-500" />
                        )}
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

