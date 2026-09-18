'use client';

import { Card, CardHeader, CardContent, IconButton, Box, TextField, Button } from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { TaskItem } from '@/features/tasks/ui/TaskItem';
import { useTasks } from '@/features/tasks';
import type { List, UpdateListDto } from '@todo-app/shared';

interface ListCardProps {
  list: List;
  onUpdateList: (listId: string, dto: UpdateListDto) => void;
  onDeleteList: (listId: string) => void;
}

export const ListCard = ({ list, onUpdateList, onDeleteList }: ListCardProps) => {
  const { tasks, createTask, updateTask, deleteTask, toggleTask } = useTasks(list.id);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  useEffect(() => {
    setTitle(list.title);
  }, [list.title]);

  const handleSaveTitle = () => {
    if (title.trim() && title !== list.title) {
      onUpdateList(list.id, { title: title.trim() });
    }
    setIsEditing(false);
  };

  const handleAddTask = async () => {
    if (newTaskTitle.trim()) {
      await createTask({ title: newTaskTitle.trim(), listId: list.id });
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  return (
    <Card
      sx={{
        minWidth: 300,
        maxWidth: 350,
        height: 'fit-content',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardHeader
        title={
          isEditing ? (
            <TextField
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              autoFocus
              fullWidth
            />
          ) : (
            list.title
          )
        }
        action={
          <Box>
            <IconButton size="small" onClick={() => setIsEditing(true)}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDeleteList(list.id)}>
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        }
      />
      <CardContent sx={{ flexGrow: 1, pt: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={(completed) => toggleTask(task.id, completed)}
              onUpdate={(title, description) => updateTask(task.id, { title, description })}
              onDelete={() => deleteTask(task.id)}
            />
          ))}

          {isAddingTask ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              <TextField
                size="small"
                placeholder="Название задачи"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTask();
                  if (e.key === 'Escape') setIsAddingTask(false);
                }}
                autoFocus
                fullWidth
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" onClick={handleAddTask} variant="contained">
                  Добавить
                </Button>
                <Button size="small" onClick={() => setIsAddingTask(false)}>
                  Отмена
                </Button>
              </Box>
            </Box>
          ) : (
            <Button
              startIcon={<Add />}
              onClick={() => setIsAddingTask(true)}
              size="small"
              sx={{ mt: 1 }}
            >
              Добавить задачу
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
