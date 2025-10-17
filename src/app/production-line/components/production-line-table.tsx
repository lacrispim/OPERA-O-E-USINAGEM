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
import { Loader2, ChevronsUpDown, Search } from 'lucide-react';
import { RequisicaoList } from './requisicao-list';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SPREADSHEET_ID = "12dXywY4L-NXhuKxJe9TuXBo-C4dtvcaWlPm6LdHeP5U";

const PREFERRED_COLUMN_ORDER = [
    "Requisição",
    "Site",
    "Data",
    "Material",
    "Nome da peça",
    "Status",
    "Quantidade",
    "Centro (minutos)",
    "Torno (minutos)",
    "Programação (minutos)",
    "Observação"
];

const SITE_OPTIONS = ["Igarassu", "Vinhedo", "Suape", "Aguaí", "Garanhuns", "Indaiatuba", "Valinhos", "Pouso Alegre", "Site A", "Campinas"];
const STATUS_OPTIONS = ["Fila de produção", "Em andamento", "Concluído", "Pendente", "Em produção", "Encerrado", "Declinado", "Tratamento", "TBD"];

const TRUNCATE_COLUMNS = ["Nome da peça", "Material", "Observação", "Site"];
const TRUNCATE_LENGTH = 25;


const TruncatedCell = ({ text }: { text: string }) => {
    if (!text || text.length <= TRUNCATE_LENGTH) {
        return <>{text || '-'}</>;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="cursor-default">{text.substring(0, TRUNCATE_LENGTH)}...</span>
            </TooltipTrigger>
            <TooltipContent>
                <p>{text}</p>
            </TooltipContent>
        </Tooltip>
    );
};


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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const rootRef = ref(database, SPREADSHEET_ID);
    const unsubscribe = onValue(
      rootRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const allNodes = Object.keys(snapshot.val());
          setNodes(allNodes);
          if (allNodes.length > 0 && !selectedNode) {
            const defaultNode = allNodes.includes('Página1') ? 'Página1' : allNodes[0];
            setSelectedNode(defaultNode);
          }
        } else {
          setError(`Nenhum nó encontrado para o Spreadsheet ID: ${SPREADSHEET_ID}`);
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
    const nodeRef = ref(database, `${SPREADSHEET_ID}/${selectedNode}`);

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

            const allHeaders = new Set<string>();
            dataArray.forEach(item => {
                Object.keys(item).forEach(key => {
                    if(key !== 'id') {
                      let header = key;
                      if (header === 'Centro') header = 'Centro (minutos)';
                      if (header === 'Torno') header = 'Torno (minutos)';
                      if (header === 'Programação') header = 'Programação (minutos)';
                      if (header === 'columnA') header = 'Site';
                      if (header === 'columnB') header = 'Data';
                      allHeaders.add(header);
                    }
                })
            });
            
             const sortedHeaders = PREFERRED_COLUMN_ORDER.filter(h => allHeaders.has(h));
             const remainingHeaders = Array.from(allHeaders).filter(h => !PREFERRED_COLUMN_ORDER.includes(h) && h !== 'id');
            
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
  
  const handleSave = async (newValue?: string) => {
    if (!editingCell || !selectedNode) return;

    const { rowId, column } = editingCell;
    const valueToSave = newValue !== undefined ? newValue : editValue;
    
    let originalColumn = column;
    if (column.endsWith(' (minutos)')) originalColumn = column.replace(' (minutos)', '');
    if (column === 'Site') originalColumn = 'columnA';
    if (column === 'Data') originalColumn = 'columnB';

    try {
      await update(ref(database, `${SPREADSHEET_ID}/${selectedNode}/${rowId}`), { [originalColumn]: valueToSave });
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
  
  const getOriginalColumnName = (header: string) => {
    if (header.endsWith(' (minutos)')) return header.replace(' (minutos)', '');
    if (header === 'Site') return 'columnA';
    if (header === 'Data') return 'columnB';
    return header;
  }

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(item => {
        return Object.values(item).some(value => 
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
    });
  }, [data, searchTerm]);


  const renderCellContent = (item: any, header: string) => {
    const isEditing = editingCell?.rowId === item.id && editingCell?.column === header;
    const originalColumn = getOriginalColumnName(header);
    const value = item[originalColumn];

    if (isEditing) {
        if (header === "Site") {
            return (
                <Select value={editValue} onValueChange={(val) => { setEditValue(val); handleSave(val); }}>
                    <SelectTrigger className="h-8 bg-background">
                        <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                        {SITE_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                </Select>
            )
        }
        if (header === "Status") {
            return (
                <Select value={editValue} onValueChange={(val) => { setEditValue(val); handleSave(val); }}>
                    <SelectTrigger className="h-8 bg-background">
                        <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                </Select>
            )
        }
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
            <Button size="sm" onClick={() => handleSave()}>Salvar</Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>Cancelar</Button>
        </div>
      );
    }
    
    if(header === "Site" || header === "Status"){
        const displayValue = String(value ?? '-');
        return (
            <div onClick={() => handleEditClick(item.id, header, value)} className="min-h-[2rem] w-full cursor-pointer">
                <div className="flex items-center justify-between rounded-md border border-input bg-transparent px-3 py-1.5 text-sm h-8">
                   <TruncatedCell text={displayValue}/>
                   <ChevronsUpDown className="h-4 w-4 opacity-50 ml-2"/>
                </div>
            </div>
        )
    }
    
    const stringValue = String(value ?? '-');

    return (
        <div onClick={() => handleEditClick(item.id, header, value)} className="min-h-[2rem] w-full cursor-pointer flex items-center p-2">
            {TRUNCATE_COLUMNS.includes(header) ? <TruncatedCell text={stringValue} /> : stringValue}
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
    <TooltipProvider>
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>Visualizador do Realtime Database</CardTitle>
            <CardDescription>
                Selecione uma aba da planilha para visualizar e editar seus dados em tempo real.
            </CardDescription>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <Select onValueChange={setSelectedNode} value={selectedNode}>
                    <SelectTrigger id="node-selector" aria-label="Selecione um Nó">
                        <SelectValue placeholder="Selecione uma aba..." />
                    </SelectTrigger>
                    <SelectContent>
                        {nodes.map(node => (
                            <SelectItem key={node} value={node}>
                                {node}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar em toda a tabela..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 md:p-2">
            {loadingNode ? (
                <div className="text-center p-6">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-muted-foreground">Carregando dados de: {selectedNode}...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHead key={header}>{header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.length > 0 ? (
                        filteredData.map((item) => (
                          <TableRow key={item.id} className="even:bg-muted/50">
                            {headers.map((header) => (
                              <TableCell key={`${item.id}-${header}`} className="p-1">
                                {renderCellContent(item, header)}
                              </TableCell>))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={headers.length} className="h-24 text-center">
                            Nenhum dado encontrado para "{selectedNode}".
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        {selectedNode === "Página1" && data.length > 0 && (
            <RequisicaoList data={data} />
        )}
      </div>
    </div>
    </TooltipProvider>
  );
}
