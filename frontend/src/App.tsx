import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { queryClient } from './lib/queryClient'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import GameLobbyPage from './pages/GameLobbyPage'
import PlayGamePage from './pages/PlayGamePage'
import AttemptResultPage from './pages/AttemptResultPage'
import CreateGamePage from './pages/CreateGamePage'
import EditGamePage from './pages/EditGamePage'
import GameStatsPage from './pages/GameStatsPage'
import MePage from './pages/MePage'
import NotFoundPage from './pages/NotFoundPage'
import PageShell from './components/PageShell'
import MuiAppProvider from './components/MuiAppProvider'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MuiAppProvider>
        <BrowserRouter>
        <PageShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/game/:id" element={<GameLobbyPage />} />
            <Route path="/game/:id/play" element={<PlayGamePage />} />
            <Route path="/attempt/:attemptId/result" element={<AttemptResultPage />} />
            <Route path="/create" element={<CreateGamePage />} />
            <Route path="/game/:id/edit" element={<EditGamePage />} />
            <Route path="/game/:id/stats" element={<GameStatsPage />} />
            <Route path="/me" element={<MePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </PageShell>
        </BrowserRouter>
      </MuiAppProvider>
    </QueryClientProvider>
  )
}

export default App
