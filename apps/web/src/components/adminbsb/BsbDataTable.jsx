import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Paper from '@mui/material/Paper';
import TableSortLabel from '@mui/material/TableSortLabel';
import SearchIcon from '@mui/icons-material/Search';
import { useAdminTheme } from 'context/ThemeCustomizationContext';

/**
 * AdminBSB Official DataTable Component (.table.table-bordered.table-striped.table-hover.dataTable)
 * 
 * @param {Array<{id: string, label: string, minWidth?: number, align?: 'left'|'center'|'right', sortable?: boolean, render?: (row: any) => React.ReactNode}>} columns
 * @param {Array<any>} rows - Data rows
 * @param {string} [searchPlaceholder='Rechercher...']
 * @param {React.ReactNode} [footerRow] - Optional custom footer row (e.g. totals)
 * @param {string} [emptyMessage='Aucune donnée disponible dans le tableau']
 * @param {boolean} [striped=true]
 * @param {boolean} [bordered=true]
 * @param {boolean} [hover=true]
 */
export default function BsbDataTable({
  columns = [],
  rows,
  data,
  searchPlaceholder = 'Rechercher...',
  footerRow,
  emptyMessage = 'Aucune donnée disponible dans le tableau',
  striped = true,
  bordered = true,
  hover = true
}) {
  const { currentSkin } = useAdminTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');

  // Récupération sécurisée des données (supporte `rows` et `data`)
  const rawRows = useMemo(() => {
    if (Array.isArray(rows)) return rows;
    if (Array.isArray(data)) return data;
    return [];
  }, [rows, data]);

  // Filtrage multi-colonnes en temps réel
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rawRows;
    const query = searchQuery.toLowerCase().trim();

    return rawRows.filter((row) => {
      const inColumns = columns.some((col) => {
        const val = row[col.id];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      });
      if (inColumns) return true;

      return Object.values(row).some((val) => {
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(query);
        }
        return false;
      });
    });
  }, [rawRows, columns, searchQuery]);

  // Tri interactif
  const sortedRows = useMemo(() => {
    if (!orderBy) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const valA = a[orderBy];
      const valB = b[orderBy];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return order === 'asc' ? valA - valB : valB - valA;
      }

      return order === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredRows, orderBy, order]);

  // Pagination
  const totalEntries = sortedRows.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage) || 1;
  const currentPage = Math.min(page, totalPages - 1);
  const paginatedRows = sortedRows.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);

  const startEntry = totalEntries === 0 ? 0 : currentPage * rowsPerPage + 1;
  const endEntry = Math.min((currentPage + 1) * rowsPerPage, totalEntries);

  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Top Controls: "Show entries" & "Search" */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2
        }}
      >
        {/* Left: Show [ 10 | 25 | 50 | 100 ] entries */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.85rem' }}>
            Afficher
          </Typography>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            style={{
              padding: '4px 8px',
              border: '1px solid #ccc',
              borderRadius: '2px',
              backgroundColor: '#ffffff',
              fontSize: '0.85rem',
              color: '#333',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.85rem' }}>
            entrées
          </Typography>
        </Box>

        {/* Right: Search box */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.85rem' }}>
            Rechercher :
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #ccc',
              borderRadius: '2px',
              px: 1,
              py: 0.25,
              bgcolor: '#ffffff',
              '&:focus-within': {
                borderColor: currentSkin?.hex || '#F44336'
              }
            }}
          >
            <SearchIcon sx={{ color: '#888888', fontSize: 18, mr: 0.5 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder={searchPlaceholder}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '0.85rem',
                color: '#333333',
                width: 160
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Main Table (.table.table-bordered.table-striped.table-hover) */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: bordered ? '1px solid #e0e0e0' : 'none',
          borderRadius: '2px',
          overflowX: 'auto',
          mb: 2
        }}
      >
        <Table size="small" sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5', borderBottom: '2px solid #dddddd' }}>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || 'left'}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    color: '#333333',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    minWidth: col.minWidth,
                    py: 1.2,
                    px: 1.5,
                    borderRight: bordered ? '1px solid #e0e0e0' : 'none'
                  }}
                >
                  {col.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : 'asc'}
                      onClick={() => handleSort(col.id)}
                      sx={{
                        '&.Mui-active': { color: currentSkin?.hex || '#F44336' },
                        '& .MuiTableSortLabel-icon': { opacity: 0.6 }
                      }}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row, rowIdx) => {
                const isEven = rowIdx % 2 === 0;
                return (
                  <TableRow
                    key={row.id || rowIdx}
                    hover={hover}
                    sx={{
                      bgcolor: striped && !isEven ? '#fafafa' : '#ffffff',
                      '&:hover': hover ? { bgcolor: '#f0f4f8 !important' } : {},
                      borderBottom: '1px solid #e9e9e9'
                    }}
                  >
                    {columns.map((col) => {
                      const cellValue = row[col.id];
                      return (
                        <TableCell
                          key={col.id}
                          align={col.align || 'left'}
                          sx={{
                            fontSize: '0.8125rem',
                            color: '#444444',
                            py: 1.1,
                            px: 1.5,
                            borderRight: bordered ? '1px solid #f0f0f0' : 'none'
                          }}
                        >
                          {col.render ? col.render(row) : (cellValue ?? '-')}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 4, color: '#888888', fontStyle: 'italic' }}
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          {footerRow && <tfoot>{footerRow}</tfoot>}
        </Table>
      </TableContainer>

      {/* Bottom Controls: "Showing X to Y of Z entries" & Pagination */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          pt: 1
        }}
      >
        <Typography variant="body2" sx={{ color: '#777777', fontSize: '0.825rem' }}>
          Affichage de <strong>{startEntry}</strong> à <strong>{endEntry}</strong> sur <strong>{totalEntries}</strong> entrées
          {searchQuery && ` (filtré à partir de ${rawRows.length} entrées au total)`}
        </Typography>

        <ButtonGroup
          size="small"
          sx={{
            '& .MuiButton-root': {
              borderRadius: '2px',
              fontSize: '0.78rem',
              fontWeight: 600,
              textTransform: 'none',
              px: 1.5,
              py: 0.5,
              borderColor: '#dddddd',
              color: '#555555'
            }
          }}
        >
          <Button
            disabled={currentPage === 0}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Précédent
          </Button>

          {Array.from({ length: totalPages }, (_, i) => {
            // Afficher au max 5 boutons de pagination autour de la page active
            if (
              totalPages > 7 &&
              i !== 0 &&
              i !== totalPages - 1 &&
              Math.abs(i - currentPage) > 2
            ) {
              if (Math.abs(i - currentPage) === 3) {
                return (
                  <Button key={i} disabled sx={{ px: 1 }}>
                    ...
                  </Button>
                );
              }
              return null;
            }

            const isActive = i === currentPage;
            return (
              <Button
                key={i}
                onClick={() => handlePageChange(i)}
                sx={{
                  bgcolor: isActive ? (currentSkin?.hex || '#F44336') + ' !important' : '#ffffff',
                  color: isActive ? '#ffffff !important' : '#555555',
                  borderColor: isActive ? (currentSkin?.hex || '#F44336') : '#dddddd',
                  fontWeight: isActive ? 800 : 500
                }}
              >
                {i + 1}
              </Button>
            );
          })}

          <Button
            disabled={currentPage >= totalPages - 1}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Suivant
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
  );
}

