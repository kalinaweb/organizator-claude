'use client';

import { Box, Button, Typography } from '@mui/material';
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">{pageTitle}</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsAdding(true)}
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
            gap: 2,
            overflowX: 'auto',
            pb: 2,
            alignItems: 'flex-start',
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
            <Box sx={{ minWidth: 300, maxWidth: 350 }}>
              <input
                type="text"
                placeholder="Название списка"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
                autoFocus
                style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
              />
              <Button onClick={handleCreateList} size="small" variant="contained">
                Создать
              </Button>
              <Button onClick={() => setIsAdding(false)} size="small" sx={{ ml: 1 }}>
                Отмена
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
