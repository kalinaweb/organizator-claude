'use client';

import { useState } from 'react';
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { ProtectedRoute } from '@/shared';
import { TopAppBar } from '@/shared/ui/AppBar';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PagesList } from '@/features/pages/ui/PagesList';
import { ListsWorkspace } from '@/features/lists/ui/ListsWorkspace';
import { usePages } from '@/features/pages';
import { Assignment } from '@mui/icons-material';

const DRAWER_WIDTH = 280;

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  const { pages, createPage, updatePage, deletePage } = usePages();

  const selectedPage = pages.find((p) => p.id === selectedPageId);

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
            sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
          >
            {isMobile ? (
              <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                  '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
                }}
              >
                {drawer}
              </Drawer>
            ) : (
              <Drawer
                variant="permanent"
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
            ) : (
              <EmptyState
                title="Выберите страницу"
                description="Выберите страницу из списка слева или создайте новую"
                icon={<Assignment sx={{ fontSize: 64 }} />}
              />
            )}
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
}
