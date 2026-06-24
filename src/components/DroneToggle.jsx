import { useState, useEffect } from 'react'
import * as Tone from 'tone'

export default function DroneToggle({ tonic, ensureAudioContext, droneVolume = 0 }) {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const fundamental = Tone.Frequency(tonic + '1').toFrequency()

    const filter = new Tone.Filter(500, 'lowpass', -12)
    const volNode = new Tone.Volume(droneVolume).toDestination()
    const gain = new Tone.Gain(0.14)
    filter.connect(gain)
    gain.connect(volNode)

    const lfo = new Tone.LFO(0.07, 0.11, 0.17)
    lfo.connect(gain.gain)
    lfo.start()

    const osc1 = new Tone.Oscillator(fundamental, 'sine')
    const osc2 = new Tone.Oscillator(fundamental * 2, 'sine')
    const osc3 = new Tone.Oscillator(fundamental * 3, 'sine')

    osc1.volume.value = -4
    osc2.volume.value = -10
    osc3.volume.value = -16

    osc1.detune.value = 4
    osc2.detune.value = -3
    osc3.detune.value = 6

    osc1.connect(filter)
    osc2.connect(filter)
    osc3.connect(filter)

    osc1.start()
    osc2.start()
    osc3.start()

    return () => {
      osc1.dispose()
      osc2.dispose()
      osc3.dispose()
      lfo.dispose()
      filter.dispose()
      gain.dispose()
      volNode.dispose()
    }
  }, [enabled, tonic, droneVolume])

  const handleToggle = async () => {
    if (!enabled && ensureAudioContext) {
      await ensureAudioContext()
    }
    setEnabled(e => !e)
  }

  return (
    <button
      onClick={handleToggle}
      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors min-h-[36px]
        flex items-center gap-1.5
        ${enabled
          ? 'bg-accent text-white'
          : 'bg-bg-700 text-gray-400 hover:bg-bg-600 hover:text-white'
        }`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h2l2-6 4 12 2-6h8" />
      </svg>
      Drone
    </button>
  )
}
