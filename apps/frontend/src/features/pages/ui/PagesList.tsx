'use client';

import { List, ListItem, ListItemButton, ListItemText, IconButton, Box, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import { useState } from 'react';
import type { Page, CreatePageDto, UpdatePageDto } from '@todo-app/shared';

interface PagesListProps {
  pages: Page[];
  selectedPageId: string | null;
  onSelectPage: (pageId: string) => void;
  onCreatePage: (dto: CreatePageDto) => void;
  onUpdatePage: (pageId: string, dto: UpdatePageDto) => void;
  onDeletePage: (pageId: string) => void;
}

export const PagesList = ({
  pages,
  selectedPageId,
  onSelectPage,
  onCreatePage,
  onUpdatePage,
  onDeletePage,
}: PagesListProps) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [deletingPage, setDeletingPage] = useState<Page | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const handleCreate = () => {
    if (newTitle.trim()) {
      onCreatePage({ title: newTitle.trim() });
      setNewTitle('');
      setCreateDialogOpen(false);
    }
  };

  const handleEdit = () => {
    if (editingPage && newTitle.trim()) {
      onUpdatePage(editingPage.id, { title: newTitle.trim() });
      setNewTitle('');
      setEditDialogOpen(false);
      setEditingPage(null);
    }
  };

  const openEditDialog = (page: Page) => {
    setEditingPage(page);
    setNewTitle(page.title);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (page: Page) => {
    setDeletingPage(page);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (deletingPage) {
      onDeletePage(deletingPage.id);
      setDeleteDialogOpen(false);
      setDeletingPage(null);
    }
  };

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Новая страница
        </Button>
      </Box>

      <List>
        {pages.map((page) => (
          <ListItem
            key={page.id}
            disablePadding
            secondaryAction={
              <Box>
                <IconButton size="small" onClick={() => openEditDialog(page)}>
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => openDeleteDialog(page)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            }
          >
            <ListItemButton
              selected={selectedPageId === page.id}
              onClick={() => onSelectPage(page.id)}
            >
              <ListItemText primary={page.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Создать страницу</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Название страницы"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') setCreateDialogOpen(false);
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleCreate} variant="contained">Создать</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Редактировать страницу</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Название страницы"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEdit();
              if (e.key === 'Escape') setEditDialogOpen(false);
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleEdit} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Удалить страницу?</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить страницу "{deletingPage?.title}"?
            Все списки и задачи на этой странице также будут удалены.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleDelete} variant="contained" color="error">Удалить</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
