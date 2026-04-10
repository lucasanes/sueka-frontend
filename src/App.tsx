import { Wifi, WifiOff } from 'lucide-react'
import { RoomRouteFallback } from './app/RoomRouteFallback'
import { useAppRoute } from './app/router'
import { goTo } from './features/game/lib/navigation'
import { useGameRoom } from './features/game/hooks/useGameRoom'
import { HomePage } from './features/game/pages/HomePage'
import { RoomPage } from './features/game/pages/RoomPage'
import './App.css'

function App() {
  const route = useAppRoute()
  const gameRoom = useGameRoom()

  return (
    <main className="app-shell min-h-svh">
      <section className="mx-auto flex min-h-svh w-full flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <header className="app-header flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <div>
            <h1 className="app-kicker text-2xl font-bold uppercase text-emerald-800">Sueka online</h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="connection-badge flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-zinc-700">
              {gameRoom.connected ? <Wifi className="h-4 w-4 text-emerald-700" /> : <WifiOff className="h-4 w-4 text-red-700" />}
              {gameRoom.connected ? 'Conectado' : 'Sem conexão'}
            </div>
          </div>
        </header>

        {route.name === 'home' ? (
          <HomePage
            error={gameRoom.error}
            onCreateRoom={gameRoom.createRoom}
            onJoinRoom={gameRoom.joinRoom}
            onPlayerNameChange={gameRoom.setPlayerName}
            onRoomCodeInputChange={gameRoom.setRoomCodeInput}
            playerName={gameRoom.playerName}
            roomCodeInput={gameRoom.roomCodeInput}
          />
        ) : gameRoom.room ? (
          <RoomPage
            activeSeatName={gameRoom.activeSeatName}
            canStart={gameRoom.canStart}
            error={gameRoom.error}
            events={gameRoom.events}
            groupedHand={gameRoom.groupedHand}
            isOwner={gameRoom.isOwner}
            isViewerTurn={gameRoom.isViewerTurn}
            lowPointsPrompt={gameRoom.lowPointsPrompt}
            onAddBot={gameRoom.addBot}
            onCopyRoomCode={gameRoom.copyRoomCode}
            onDismissLowPointsPrompt={gameRoom.dismissLowPointsPrompt}
            onLeaveRoom={gameRoom.leaveRoom}
            onPlayCard={gameRoom.playCard}
            onRestartGame={gameRoom.restartGame}
            onRestartMatch={gameRoom.restartMatch}
            onStartGame={gameRoom.startGame}
            onTakeSeat={gameRoom.takeSeat}
            room={gameRoom.room}
            viewerTeamLabel={gameRoom.viewerTeamLabel}
          />
        ) : (
          <RoomRouteFallback error={gameRoom.error} onGoHome={() => goTo('/')} roomCode={route.roomCode} />
        )}
      </section>
    </main>
  )
}

export default App
