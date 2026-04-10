import type { FormEvent } from 'react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'

type HomePageProps = {
  playerName: string
  roomCodeInput: string
  error: string
  onPlayerNameChange: (value: string) => void
  onRoomCodeInputChange: (value: string) => void
  onCreateRoom: (event: FormEvent) => void
  onJoinRoom: (event?: FormEvent) => void
}

export function HomePage({
  playerName,
  roomCodeInput,
  error,
  onPlayerNameChange,
  onRoomCodeInputChange,
  onCreateRoom,
  onJoinRoom,
}: HomePageProps) {
  return (
    <div className="grid flex-1 items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        <p className="app-lead max-w-2xl text-lg text-zinc-700">
          Crie uma sala, compartilhe o código e jogue Sueka em duplas. O servidor guarda a partida em memória e cada pessoa vê só a própria mão.
        </p>
        <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
          <div className="theme-surface rounded-md border bg-white p-4">
            <p className="theme-heading text-2xl font-black text-zinc-950">40</p>
            <p className="theme-text-soft text-sm text-zinc-600">cartas no baralho</p>
          </div>
          <div className="theme-surface rounded-md border bg-white p-4">
            <p className="theme-heading text-2xl font-black text-zinc-950">4</p>
            <p className="theme-text-soft text-sm text-zinc-600">jogadores sentados</p>
          </div>
          <div className="theme-surface rounded-md border bg-white p-4">
            <p className="theme-heading text-2xl font-black text-zinc-950">2</p>
            <p className="theme-text-soft text-sm text-zinc-600">duplas opostas</p>
          </div>
        </div>
      </div>

      <div className="theme-surface rounded-md border bg-white p-5 shadow-sm">
        <form className="space-y-4" onSubmit={roomCodeInput ? onJoinRoom : onCreateRoom}>
          <div>
            <label className="theme-label mb-2 block text-sm font-semibold text-zinc-800" htmlFor="player-name">
              Seu nome
            </label>
            <Input
              id="player-name"
              maxLength={24}
              onChange={(event) => onPlayerNameChange(event.target.value)}
              placeholder="Ex: Lucas"
              value={playerName}
            />
          </div>

          <div>
            <label className="theme-label mb-2 block text-sm font-semibold text-zinc-800" htmlFor="room-code">
              Código da sala
            </label>
            <Input
              id="room-code"
              maxLength={6}
              onChange={(event) => onRoomCodeInputChange(event.target.value.toUpperCase())}
              placeholder="Deixe vazio para criar"
              value={roomCodeInput}
            />
          </div>

          {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

          <div className="grid gap-2 sm:grid-cols-2">
            <Button disabled={!playerName.trim()} onClick={onCreateRoom} type="button">
              Criar sala
            </Button>
            <Button disabled={!playerName.trim() || !roomCodeInput.trim()} type="submit" variant="secondary">
              Entrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

