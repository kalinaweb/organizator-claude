'use client';

import { useEffect, useState } from 'react';
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { ProtectedRoute } from '@/shared';
import { TopAppBar } from '@/shared/ui/AppBar';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PagesList } from '@/features/pages/ui/PagesList';
import { ListsWorkspace } from '@/features/lists/ui/ListsWorkspace';
import { usePages } from '@/features/pages';
import { Assignment, Add } from '@mui/icons-material';

const DRAWER_WIDTH = 280;

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  const { pages, createPage, updatePage, deletePage } = usePages();

  const selectedPage = pages.find((p) => p.id === selectedPageId);

  // Auto-select first page when pages exist and nothing is selected
  useEffect(() => {
    if (pages.length > 0 && !selectedPageId) {
      setSelectedPageId(pages[0].id);
    }
  }, [pages, selectedPageId]);

  const handleSelectPage = (pageId: string) => {
    setSelectedPageId(pageId);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    await deletePage(pageId);
    if (selectedPageId === pageId) {
      setSelectedPageId(null);
    }
  };

  const drawer = (
    <PagesList
      pages={pages}
      selectedPageId={selectedPageId}
      onSelectPage={handleSelectPage}
      onCreatePage={createPage}
      onUpdatePage={updatePage}
      onDeletePage={handleDeletePage}
    />
  );

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>        
        <TopAppBar />

        <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <Box
            component="nav"
            sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 }, display: 'flex' }}
          >
            {isMobile ? (
              <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                ModalProps={{ keepMounted: true }}
                PaperProps={{ sx: { bgcolor: 'background.paper' } }}
                sx={{
                  '& .MuiDrawer-paper': { width: DRAWER_WIDTH }
                }}
              >
                {drawer}
              </Drawer>
            ) : (
              <Drawer
                variant="permanent"
                PaperProps={{ sx: { bgcolor: 'background.paper' } }}
                sx={{
                  '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    position: 'relative',
                    height: '100%',
                  },
                }}
                open
              >
                {drawer}
              </Drawer>
            )}
          </Box>

          {/* Main content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              bgcolor: 'background.default',
            }}
          >
            {selectedPage ? (
              <ListsWorkspace pageId={selectedPage.id} pageTitle={selectedPage.title} />
            ) : pages.length > 0 ? (
              <EmptyState
                title="Выберите страницу"
                description="Выберите страницу из списка слева или создайте новую"
                icon={<Assignment sx={{ fontSize: 64 }} />}
              />
            ) : (
              <EmptyState
                title="Создайте страницу"
                description="У вас ещё нет страниц. Создайте первую, чтобы начать работу"
                actionLabel="Создать страницу"
                onAction={() => createPage({ title: 'Моя страница' })}
                icon={<Add sx={{ fontSize: 64 }} />}
              />
            )}
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
