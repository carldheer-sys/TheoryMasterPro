export default function VolumeModal({ pianoVolume, droneVolume, onPianoVolumeChange, onDroneVolumeChange, onClose }) {
  return (
    <div className="space-y-6">
      <p className="text-gray-400 text-sm">
        Adjust the volume of the piano and drone sounds. Values are in decibels (dB).
      </p>

      {/* Piano volume */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-white">Piano</label>
          <span className="text-sm font-bold text-accent-light tabular-nums">
            {pianoVolume > 0 ? `+${pianoVolume}` : pianoVolume} dB
          </span>
        </div>
        <input
          type="range"
          min={-20}
          max={6}
          step={0.5}
          value={pianoVolume}
          onChange={(e) => onPianoVolumeChange(Number(e.target.value))}
          className="w-full accent-accent cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>-20</span>
          <span>0</span>
          <span>+6</span>
        </div>
      </div>

      {/* Drone volume */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-white">Drone</label>
          <span className="text-sm font-bold text-accent-light tabular-nums">
            {droneVolume > 0 ? `+${droneVolume}` : droneVolume} dB
          </span>
        </div>
        <input
          type="range"
          min={-20}
          max={6}
          step={0.5}
          value={droneVolume}
          onChange={(e) => onDroneVolumeChange(Number(e.target.value))}
          className="w-full accent-accent cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>-20</span>
          <span>0</span>
          <span>+6</span>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-accent text-white font-bold hover:bg-accent-hover transition-colors"
      >
        Done
      </button>
    </div>
  )
}
