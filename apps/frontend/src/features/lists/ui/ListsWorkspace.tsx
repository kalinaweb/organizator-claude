'use client';

import { Box, Button, Card, TextField, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useState } from 'react';
import { ListCard } from './ListCard';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useLists } from '../model/useLists';

interface ListsWorkspaceProps {
  pageId: string;
  pageTitle: string;
}

export const ListsWorkspace = ({ pageId, pageTitle }: ListsWorkspaceProps) => {
  const { lists, createList, updateList, deleteList } = useLists(pageId);
  const [isAdding, setIsAdding] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const handleCreateList = async () => {
    if (newListTitle.trim()) {
      await createList({ title: newListTitle.trim(), pageId });
      setNewListTitle('');
      setIsAdding(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
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
            '&::-webkit-scrollbar': {
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: '#F0F2F5',
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: '#C4CDD5',
              borderRadius: 4,
              '&:hover': {
                bgcolor: '#A8B3BD',
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
