import { useState, useEffect, useRef, useCallback } from 'react'
import * as Tone from 'tone'

/**
 * useMidi — manages Web MIDI API connection.
 * - On desktop/tablet with MIDI support: connects to MIDI input devices.
 * - On mobile (iPhone) or browsers without Web MIDI: gracefully returns supported=false.
 *
 * Returns:
 *   { supported, devices, activeNotes, connectionStatus }
 *   - activeNotes: Set of currently held MIDI note numbers
 */
export function useMidi() {
  const [supported, setSupported] = useState(null) // null = unknown, true/false after check
  const [devices, setDevices] = useState([])
  const [activeNotes, setActiveNotes] = useState(() => new Set())
  const [connectionStatus, setConnectionStatus] = useState('checking')
  const midiAccessRef = useRef(null)
  const samplerRef = useRef(null)

  // Initialize Tone.js sampler once
  useEffect(() => {
    samplerRef.current = new Tone.Sampler({
      urls: {
        'C2': 'C2.mp3',
        'C3': 'C3.mp3',
        'C4': 'C4.mp3',
        'C5': 'C5.mp3',
        'C6': 'C6.mp3',
        'C7': 'C7.mp3',
        'A2': 'A2.mp3',
        'A3': 'A3.mp3',
        'A4': 'A4.mp3',
        'A5': 'A5.mp3',
        'A6': 'A6.mp3',
      },
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
      onload: () => {
        // Sampler loaded
      }
    }).toDestination()

    return () => {
      if (samplerRef.current) {
        samplerRef.current.dispose()
        samplerRef.current = null
      }
    }
  }, [])

  // Handle a note-on message
  const handleNoteOn = useCallback((note, velocity) => {
    // Try to start audio context on first MIDI input
    if (Tone.getContext().state !== 'running') {
      Tone.start().catch(() => {})
    }
    // Play piano sound via Tone.js
    if (samplerRef.current && Tone.getContext().state === 'running') {
      const freq = Tone.Frequency(note, 'midi').toFrequency()
      samplerRef.current.triggerAttack(freq, undefined, velocity / 127)
    }

    if (velocity === 0) {
      // Note-on with velocity 0 = note-off
      setActiveNotes(prev => {
        const next = new Set(prev)
        next.delete(note)
        return next
      })
      if (samplerRef.current && Tone.getContext().state === 'running') {
        const freq = Tone.Frequency(note, 'midi').toFrequency()
        samplerRef.current.triggerRelease(freq)
      }
    } else {
      setActiveNotes(prev => {
        const next = new Set(prev)
        next.add(note)
        return next
      })
    }
  }, [])

  // Handle a note-off message
  const handleNoteOff = useCallback((note) => {
    // Release piano sound
    if (samplerRef.current && Tone.getContext().state === 'running') {
      const freq = Tone.Frequency(note, 'midi').toFrequency()
      samplerRef.current.triggerRelease(freq)
    }
    setActiveNotes(prev => {
      const next = new Set(prev)
      next.delete(note)
      return next
    })
  }, [])

  // Attach listeners to a single input device
  const attachToDevice = useCallback((input) => {
    input.onmidimessage = (message) => {
      const [status, note, velocity] = message.data
      const command = status & 0xf0

      if (command === 0x90 && velocity > 0) {
        handleNoteOn(note, velocity)
      } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
        handleNoteOff(note)
      }
    }
  }, [handleNoteOn, handleNoteOff])

  // Refresh device list and attach to all available inputs
  const refreshDevices = useCallback(() => {
    if (!midiAccessRef.current) return
    const inputs = Array.from(midiAccessRef.current.inputs.values())
    setDevices(inputs.map(d => ({ id: d.id, name: d.name, manufacturer: d.manufacturer })))
    inputs.forEach(input => attachToDevice(input))

    if (inputs.length > 0) {
      setConnectionStatus('connected')
    } else {
      setConnectionStatus('no-devices')
    }
  }, [attachToDevice])

  // Initialize Web MIDI
  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      setSupported(false)
      setConnectionStatus('unsupported')
      return
    }

    let cancelled = false

    navigator.requestMIDIAccess({ sysex: false })
      .then((access) => {
        if (cancelled) return
        setSupported(true)
        midiAccessRef.current = access

        refreshDevices()

        access.onstatechange = () => {
          refreshDevices()
        }
      })
      .catch((err) => {
        if (cancelled) return
        console.warn('MIDI access denied:', err)
        setSupported(false)
        setConnectionStatus('denied')
      })

    return () => {
      cancelled = true
    }
  }, [refreshDevices])

  // Clear all active notes when component unmounts
  const clearAllNotes = useCallback(() => {
    setActiveNotes(new Set())
  }, [])

  // Ensure Tone.js audio context is running (must be called from user gesture)
  const ensureAudioContext = useCallback(async () => {
    if (Tone.getContext().state !== 'running') {
      await Tone.start()
    }
  }, [])

  // Simulate a note-on from a click/touch (for on-screen keyboard)
  const simulateNoteOn = useCallback((note) => {
    if (Tone.getContext().state !== 'running') {
      Tone.start().catch(() => {})
    }
    if (samplerRef.current && Tone.getContext().state === 'running') {
      const freq = Tone.Frequency(note, 'midi').toFrequency()
      samplerRef.current.triggerAttack(freq, undefined, 0.8)
    }
    setActiveNotes(prev => {
      const next = new Set(prev)
      next.add(note)
      return next
    })
  }, [])

  // Simulate a note-off from a click/touch release
  const simulateNoteOff = useCallback((note) => {
    if (samplerRef.current && Tone.getContext().state === 'running') {
      const freq = Tone.Frequency(note, 'midi').toFrequency()
      samplerRef.current.triggerRelease(freq)
    }
    setActiveNotes(prev => {
      const next = new Set(prev)
      next.delete(note)
      return next
    })
  }, [])

  return { supported, devices, activeNotes, connectionStatus, clearAllNotes, ensureAudioContext, simulateNoteOn, simulateNoteOff }
}
