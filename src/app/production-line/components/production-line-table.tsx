'use client';

import { useEffect, useState, useMemo } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, off, update } from 'firebase/database';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { NodeDataChart } from './node-data-chart';

const PREFERRED_COLUMN_ORDER = [
    "Site",
    "Data",
    "Requisição",
    "Material",
    "Nome da peça",
    "Status",
    "Quantidade",
    "Centro (minutos)",
    "Torno (minutos)",
    "Programação (minutos)",
];

export function ProductionLineTable() {
  const [nodes, setNodes] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<string>('');
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNode, setLoadingNode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ rowId: string; column: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  useEffect(() => {
    const rootRef = ref(database);
    const unsubscribe = onValue(
      rootRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const allNodes = Object.keys(snapshot.val());
          setNodes(allNodes);
          if (allNodes.length > 0 && !selectedNode) {
            // Pre-select 'Página 1' if it exists, otherwise the first node.
            const defaultNode = allNodes.includes('Página 1') ? 'Página 1' : allNodes[0];
            setSelectedNode(defaultNode);
          }
        } else {
          setNodes([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Firebase error:', error);
        setError('Falha ao carregar a lista de nós do Firebase.');
        setLoading(false);
      }
    );

    return () => off(rootRef);
  }, [selectedNode]);

  useEffect(() => {
    if (!selectedNode) return;

    setLoadingNode(true);
    setData([]);
    setHeaders([]);
    const nodeRef = ref(database, selectedNode);

    const unsubscribeNode = onValue(
      nodeRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const rawData = snapshot.val();
          if (typeof rawData === 'object' && rawData !== null) {
            const dataArray = Object.keys(rawData).map((key) => ({
              id: key,
              ...rawData[key],
            }));

            // Extract headers from all items to handle varying structures
            const allHeaders = new Set<string>();
            dataArray.forEach(item => {
                Object.keys(item).forEach(key => {
                    if(key !== 'id') allHeaders.add(key === 'Centro' ? 'Centro (minutos)' : key);
                })
            });

            // Reorder headers based on preferred order
             const sortedHeaders = PREFERRED_COLUMN_ORDER.filter(h => allHeaders.has(h));
             const remainingHeaders = Array.from(allHeaders).filter(h => !PREFERRED_COLUMN_ORDER.includes(h));
            
            setHeaders([...sortedHeaders, ...remainingHeaders]);
            setData(dataArray);
          } else {
             setData([]);
             setHeaders([]);
          }
        } else {
          setData([]);
          setHeaders([]);
        }
        setLoadingNode(false);
      },
      (error) => {
        console.error('Firebase node error:', error);
        setError(`Falha ao carregar dados do nó "${selectedNode}".`);
        setLoadingNode(false);
      }
    );

    return () => off(nodeRef);
  }, [selectedNode]);

  const handleEditClick = (rowId: string, column: string, value: any) => {
    setEditingCell({ rowId, column });
    setEditValue(String(value ?? ''));
  };

  const handleSave = async () => {
    if (!editingCell || !selectedNode) return;

    const { rowId, column } = editingCell;
    const originalColumn = column === 'Centro (minutos)' ? 'Centro' : column;

    try {
      await update(ref(database, `${selectedNode}/${rowId}`), { [originalColumn]: editValue });
      toast({
        title: 'Sucesso',
        description: 'Valor atualizado com sucesso.',
      });
    } catch (err) {
      console.error('Failed to update value:', err);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao atualizar o valor.',
      });
    } finally {
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const renderCellContent = (item: any, header: string) => {
    const isEditing = editingCell?.rowId === item.id && editingCell?.column === header;

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
            <Input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') handleCancel();
                }}
                className="h-8"
            />
            <Button size="sm" onClick={handleSave}>Salvar</Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>Cancelar</Button>
        </div>
      );
    }
    
    const value = item[header] ?? (header === 'Centro (minutos)' ? item['Centro'] : undefined);

    return (
        <div onClick={() => handleEditClick(item.id, header, value)} className="min-h-[2rem] w-full cursor-pointer">
            {typeof value === 'object' && value !== null
            ? JSON.stringify(value)
            : String(value ?? '-')}
        </div>
    )
  };
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p>Conectando ao Firebase...</p>
        </CardContent>
      </Card>
    );
  }

  if (error && !loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Visualizador do Realtime Database</CardTitle>
          <CardDescription>
              Selecione um nó para visualizar e editar seus dados em tempo real.
          </CardDescription>
          <div className="w-full md:w-1/3 pt-4">
              <Select onValueChange={setSelectedNode} value={selectedNode}>
                  <SelectTrigger id="node-selector" aria-label="Selecione um Nó">
                      <SelectValue placeholder="Selecione um nó..." />
                  </SelectTrigger>
                  <SelectContent>
                      {nodes.map(node => (
                          <SelectItem key={node} value={node}>
                              {node}
                          </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {loadingNode ? (
               <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  <p className="mt-2 text-muted-foreground">Carregando dados do nó: {selectedNode}...</p>
               </div>
          ) : (
              <div className="overflow-x-auto">
              <Table>
                  <TableHeader>
                  <TableRow>
                      <TableHead>ID</TableHead>
                      {headers.map((header) => (
                      <TableHead key={header}>{header}</TableHead>
                      ))}
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  {data.map((item) => (
                      <TableRow key={item.id}>
                      <TableCell className="font-medium text-muted-foreground">{item.id}</TableCell>
                      {headers.map((header) => (
                          <TableCell key={header}>
                              {renderCellContent(item, header)}
                          </TableCell>
                      ))}
                      </TableRow>
                  ))}
                  {data.length === 0 && (
                      <TableRow>
                      <TableCell colSpan={headers.length + 1} className="h-24 text-center">
                          Nenhum dado encontrado para o nó "{selectedNode}".
                      </TableCell>
                      </TableRow>
                  )}
                  </TableBody>
              </Table>
              </div>
          )}
        </CardContent>
      </Card>
      {selectedNode === "Página 1" && data.length > 0 && (
          <NodeDataChart data={data} />
      )}
    </div>
  );
}
