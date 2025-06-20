'use client';

import { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  nome: string | null;
  sobrenome: string | null;
  email: string;
  created_at: string;
  is_verified: boolean;
}

interface Invite {
  id: number;
  email: string;
  expires_at: string;
}

// O fetcher para o SWR, que busca os dados da nossa API
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('Falha ao buscar dados.');
  }
  return res.json();
});

export default function UsersPage() {
  const { data: users, error: usersError, isLoading: isLoadingUsers, mutate: mutateUsers } = useSWR<User[]>('/api/users', fetcher);
  const { data: invites, error: invitesError, isLoading: isLoadingInvites, mutate: mutateInvites } = useSWR<Invite[]>('/api/users/invites', fetcher);
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isViewInvitesModalOpen, setIsViewInvitesModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [isResendingId, setIsResendingId] = useState<number | null>(null);
  const [deletingInviteId, setDeletingInviteId] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const deleteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isDeletingUsers, setIsDeletingUsers] = useState(false);

  const formatDate = (dateString: string, includeTime = false) => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAllUsers = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(users?.map(user => user.id) || []);
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleBulkDelete = async () => {
    setIsDeletingUsers(true);
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedUserIds }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Falha ao remover usuários.');
      }
      
      toast.success(data.message);
      setSelectedUserIds([]);
      mutateUsers(); // Revalida os dados da tabela de usuários
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Ocorreu um erro desconhecido.');
      }
    } finally {
      setIsDeletingUsers(false);
      setIsConfirmDeleteModalOpen(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingInvite(true);

    try {
      const res = await fetch('/api/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newUserEmail }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Falha ao enviar convite.');
      }

      toast.success('Convite enviado com sucesso!');
      setNewUserEmail('');
      setIsInviteModalOpen(false);
      mutateInvites(); // Revalida a lista de convites
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || 'Ocorreu um erro.');
      } else {
        toast.error('Ocorreu um erro desconhecido.');
      }
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleResendInvite = async (inviteId: number) => {
    setIsResendingId(inviteId);
    try {
      const res = await fetch(`/api/users/invites/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inviteId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Falha ao reenviar convite.');
      }

      toast.success('Convite reenviado com sucesso!');
      mutateInvites(); // Revalida a lista de convites
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || 'Ocorreu um erro ao reenviar.');
      } else {
        toast.error('Ocorreu um erro desconhecido.');
      }
    } finally {
      setIsResendingId(null);
    }
  };

  const startDeleteProcess = (inviteId: number) => {
    cancelDeleteProcess(); // Garante que nenhum outro processo esteja rodando
    setDeletingInviteId(inviteId);
    setProgress(0);

    const startTime = Date.now();
    const duration = 5000; // 5 segundos

    progressIntervalRef.current = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const newProgress = (elapsedTime / duration) * 100;
      if (newProgress >= 100) {
        clearInterval(progressIntervalRef.current!);
        setProgress(100);
      } else {
        setProgress(newProgress);
      }
    }, 50);

    deleteTimerRef.current = setTimeout(() => {
      handleConfirmDelete(inviteId);
    }, duration);
  };

  const cancelDeleteProcess = () => {
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setDeletingInviteId(null);
    setProgress(0);
  };

  const handleConfirmDelete = async (inviteId: number) => {
    cancelDeleteProcess();
    try {
      const res = await fetch(`/api/users/invites`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inviteId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Falha ao remover convite.');
      }

      toast.success('Convite removido com sucesso!');
      mutateInvites();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || 'Ocorreu um erro ao remover.');
      } else {
        toast.error('Ocorreu um erro desconhecido.');
      }
    }
  };

  useEffect(() => {
    // Limpa os timers quando o componente é desmontado
    return () => {
      cancelDeleteProcess();
    };
  }, []);

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>
            Lista de todos os usuários cadastrados no sistema.
          </CardDescription>
          </div>
          <div className="flex gap-2">
            {selectedUserIds.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Ações ({selectedUserIds.length})</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setIsConfirmDeleteModalOpen(true)} className="text-red-600">
                    Excluir Selecionados
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

            {invites && invites.length > 0 && (
              <Button variant="outline" onClick={() => setIsViewInvitesModalOpen(true)}>Ver Convites</Button>
            )}
            <Button onClick={() => setIsInviteModalOpen(true)}>Criar Novo Usuário</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingUsers && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          {usersError && <p className="text-red-500">Erro ao carregar usuários.</p>}
          {users && !isLoadingUsers && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={selectedUserIds.length > 0 && selectedUserIds.length === users.length}
                      onCheckedChange={handleSelectAllUsers}
                    />
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} data-state={selectedUserIds.includes(user.id) ? "selected" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUserIds.includes(user.id)}
                        onCheckedChange={() => handleSelectUser(user.id)}
                      />
                    </TableCell>
                    <TableCell>{user.nome || '-'} {user.sobrenome || ''}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_verified ? 'default' : 'destructive'}>
                        {user.is_verified ? 'Verificado' : 'Não Verificado'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar Novo Usuário</DialogTitle>
            <DialogDescription>
              Digite o e-mail do novo usuário para enviar um convite de cadastro.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendInvite}>
            <div className="space-y-2">
              <Label htmlFor="email">Email do novo usuário</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
                required
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit" disabled={isSendingInvite}>
                {isSendingInvite ? 'Enviando...' : 'Enviar Convite'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewInvitesModalOpen} onOpenChange={setIsViewInvitesModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Convites Pendentes</DialogTitle>
            <DialogDescription>
              Lista de todos os convites enviados que ainda não foram aceitos.
            </DialogDescription>
          </DialogHeader>
          {isLoadingInvites && <Skeleton className="h-10 w-full" />}
          {invitesError && <p className="text-red-500">Erro ao carregar convites.</p>}
          {invites && !isLoadingInvites && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.length > 0 ? (
                  invites.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell>{invite.email}</TableCell>
                      <TableCell>{formatDate(invite.expires_at, true)}</TableCell>
                      <TableCell className="text-right">
                        {deletingInviteId === invite.id ? (
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="h-2 w-32" />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelDeleteProcess}
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleResendInvite(invite.id)}
                              disabled={isResendingId === invite.id}
                            >
                              {isResendingId === invite.id ? 'Reenviando...' : 'Reenviar'}
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => startDeleteProcess(invite.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">Nenhum convite pendente.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmDeleteModalOpen} onOpenChange={setIsConfirmDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir {selectedUserIds.length} usuário(s)? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsConfirmDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={isDeletingUsers}>
              {isDeletingUsers ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 