import { Button } from '../components/ui/button'

type RoomRouteFallbackProps = {
  roomCode: string
  error?: string
  onGoHome: () => void
}

export function RoomRouteFallback({ roomCode, error, onGoHome }: RoomRouteFallbackProps) {
  return (
    <div className="grid flex-1 items-center">
      <div className="theme-surface mx-auto max-w-lg rounded-md border bg-white p-6 text-center shadow-sm">
        <p className="theme-caption text-xs font-bold uppercase text-zinc-500">Sala</p>
        <p className="theme-heading mt-1 text-3xl font-black text-zinc-950">{roomCode}</p>
        <p className="theme-text-soft mt-3 text-sm text-zinc-600">
          {error || 'Tentando entrar na sala e restaurar sua sessão.'}
        </p>
        <div className="mt-5">
          <Button onClick={onGoHome} variant="secondary">
            Voltar para a página inicial
          </Button>
        </div>
      </div>
    </div>
  )
}
