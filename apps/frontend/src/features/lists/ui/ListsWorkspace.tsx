'use client';

import { Box, Button, Card, TextField, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useState, useCallback, useRef } from 'react';
import { ListCard } from './ListCard';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useLists } from '../model/useLists';
import { useThemeMode } from '@/app/providers';

interface ListsWorkspaceProps {
  pageId: string;
  pageTitle: string;
}

export const ListsWorkspace = ({ pageId, pageTitle }: ListsWorkspaceProps) => {
  const { themeMode } = useThemeMode();
  const { lists, createList, updateList, deleteList, refetch } = useLists(pageId);
  const [isAdding, setIsAdding] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const taskRefetchMapRef = useRef<Map<string, () => Promise<void>>>(new Map());

  const registerTaskRefetch = useCallback((listId: string, refetchFn: () => Promise<void>) => {
    taskRefetchMapRef.current.set(listId, refetchFn as () => Promise<void>);
  }, []);

  const refetchSourceList = useCallback(async (listId: string) => {
    const refetchFn = taskRefetchMapRef.current.get(listId);
    if (refetchFn) {
      await refetchFn();
    }
  }, []);

  const handleCreateList = async () => {
    if (newListTitle.trim()) {
      await createList({ title: newListTitle.trim(), pageId });
      setNewListTitle('');
      setIsAdding(false);
    }
  };

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%', background: `url(/background-lists-${themeMode}.svg)`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPositionY: '250px'}}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {pageTitle}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsAdding(true)}
          sx={{
            px: 3,
            py: 1.25,
            fontWeight: 600,
            boxShadow: '0px 4px 12px rgba(0, 188, 212, 0.25)',
            color: 'primary.contrastText',
          }}
        >
          Добавить список
        </Button>
      </Box>

      {lists.length === 0 && !isAdding ? (
        <EmptyState
          title="Нет списков"
          description="Создайте первый список для организации задач"
          actionLabel="Создать список"
          onAction={() => setIsAdding(true)}
        />
      ) : (
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            overflowX: 'auto',
            pb: 3,
            alignItems: 'flex-start',
            flexGrow: 1,
            '&::-webkit-scrollbar': {
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'background.default',
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'text.secondary',
              borderRadius: 4,
              '&:hover': {
                bgcolor: 'text.primary',
              },
            },
          }}
        >
          {lists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              onUpdateList={updateList}
              onDeleteList={deleteList}
              onRefetch={refetch}
              onRefetchSourceList={refetchSourceList}
              onRegisterTaskRefetch={registerTaskRefetch}
            />
          ))}

          {isAdding && (
            <Card sx={{ minWidth: 320, maxWidth: 370, p: 2 }}>
              <TextField
                placeholder="Название списка"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
                autoFocus
                fullWidth
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={handleCreateList} size="small" variant="contained" sx={{ fontWeight: 600 }}>
                  Создать
                </Button>
                <Button onClick={() => setIsAdding(false)} size="small">
                  Отмена
                </Button>
              </Box>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
};
