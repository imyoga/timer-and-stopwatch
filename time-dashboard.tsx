"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function TimeDashboard() {
  // Real-time Clock State
  const [currentDateTime, setCurrentDateTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  const [currentTimezone, setCurrentTimezone] = useState("")

  // Stopwatch States
  const [stopwatchTime, setStopwatchTime] = useState(0)
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false)
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [laps, setLaps] = useState<number[]>([]) // New state for laps

  // Timer States
  const [timerInputHours, setTimerInputHours] = useState(0)
  const [timerInputMinutes, setTimerInputMinutes] = useState(0)
  const [timerInputSeconds, setTimerInputSeconds] = useState(0)
  const [timerTimeRemaining, setTimerTimeRemaining] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const initialTimerDurationRef = useRef(0) // To store the initial duration for reset

  // Real-time Clock Effect
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setCurrentDateTime(
        now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
      )
      setCurrentDate(
        now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      )
      setCurrentTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    }
    updateClock() // Set initial time immediately
    const intervalId = setInterval(updateClock, 1000)
    return () => clearInterval(intervalId)
  }, [])

  // Stopwatch Effects and Handlers
  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchTime((prevTime) => prevTime + 0.01) // Update every 10ms for centiseconds
      }, 10)
    } else {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current)
      }
    }
    return () => {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current)
      }
    }
  }, [isStopwatchRunning])

  const handleStopwatchStart = () => {
    setIsStopwatchRunning(true)
  }

  const handleStopwatchPause = () => {
    setIsStopwatchRunning(false)
  }

  const handleStopwatchReset = () => {
    setIsStopwatchRunning(false)
    setStopwatchTime(0)
    setLaps([]) // Clear laps on reset
    if (stopwatchIntervalRef.current) {
      clearInterval(stopwatchIntervalRef.current)
    }
  }

  const handleStopwatchLap = () => {
    if (isStopwatchRunning) {
      setLaps((prevLaps) => [...prevLaps, stopwatchTime])
    }
  }

  const formatStopwatchTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = Math.floor(timeInSeconds % 60)
    const centiseconds = Math.floor((timeInSeconds * 100) % 100)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`
  }

  // Timer Effects and Handlers
  useEffect(() => {
    if (isTimerRunning && timerTimeRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerTimeRemaining((prevTime) => Math.max(0, prevTime - 1))
      }, 1000)
    } else if (timerTimeRemaining === 0 && isTimerRunning) {
      setIsTimerRunning(false)
      // Optionally, add a sound or visual alert here
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [isTimerRunning, timerTimeRemaining])

  const handleTimerStart = () => {
    if (timerTimeRemaining === 0) {
      const totalSeconds = timerInputHours * 3600 + timerInputMinutes * 60 + timerInputSeconds
      if (totalSeconds > 0) {
        setTimerTimeRemaining(totalSeconds)
        initialTimerDurationRef.current = totalSeconds // Store for reset
        setIsTimerRunning(true)
      }
    } else {
      setIsTimerRunning(true)
    }
  }

  const handleTimerPause = () => {
    setIsTimerRunning(false)
  }

  const handleTimerReset = () => {
    setIsTimerRunning(false)
    setTimerTimeRemaining(0)
    setTimerInputHours(0)
    setTimerInputMinutes(0)
    setTimerInputSeconds(0)
    initialTimerDurationRef.current = 0
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
  }

  const formatTimerTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = Math.floor(totalSeconds % 60)
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const isTimerSet = timerInputHours > 0 || timerInputMinutes > 0 || timerInputSeconds > 0 || timerTimeRemaining > 0

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-50">
      {/* Real-time Clock */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="text-6xl md:text-7xl lg:text-8xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400"
          aria-live="polite"
        >
          {currentDateTime}
        </div>
        <div className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-700 dark:text-gray-300 mt-2">
          {currentDate}
        </div>
        <div className="text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-400">{currentTimezone}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* Timer Card */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl p-6 flex flex-col items-center gap-6 border-none">
          <CardContent className="flex flex-col items-center gap-6 p-0">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-50">Timer</h2>
            <div
              className="text-5xl md:text-6xl font-bold tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500 dark:from-blue-400 dark:to-teal-400"
              aria-live="polite"
            >
              {formatTimerTime(timerTimeRemaining)}
            </div>
            {!isTimerRunning && timerTimeRemaining === 0 && (
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex flex-col items-center">
                  <Label htmlFor="timer-hours" className="mb-1 text-sm">
                    Hours
                  </Label>
                  <Input
                    id="timer-hours"
                    type="number"
                    placeholder="00"
                    min="0"
                    max="99"
                    value={timerInputHours}
                    onChange={(e) => setTimerInputHours(Number(e.target.value))}
                    className="w-20 text-center text-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <Label htmlFor="timer-minutes" className="mb-1 text-sm">
                    Minutes
                  </Label>
                  <Input
                    id="timer-minutes"
                    type="number"
                    placeholder="00"
                    min="0"
                    max="59"
                    value={timerInputMinutes}
                    onChange={(e) => setTimerInputMinutes(Number(e.target.value))}
                    className="w-20 text-center text-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <Label htmlFor="timer-seconds" className="mb-1 text-sm">
                    Seconds
                  </Label>
                  <Input
                    id="timer-seconds"
                    type="number"
                    placeholder="00"
                    min="0"
                    max="59"
                    value={timerInputSeconds}
                    onChange={(e) => setTimerInputSeconds(Number(e.target.value))}
                    className="w-20 text-center text-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
            )}
            <div className="flex gap-4">
              <Button
                onClick={isTimerRunning ? handleTimerPause : handleTimerStart}
                className="bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:from-blue-600 hover:to-teal-600 shadow-md"
                disabled={!isTimerSet && !isTimerRunning}
              >
                {isTimerRunning ? "Pause" : timerTimeRemaining > 0 ? "Resume" : "Start"}
              </Button>
              <Button
                onClick={handleTimerReset}
                variant="outline"
                className="border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700 dark:hover:text-blue-300 shadow-md bg-transparent"
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stopwatch Card */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl p-6 flex flex-col items-center gap-6 border-none">
          <CardContent className="flex flex-col items-center gap-6 p-0">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-50">Stopwatch</h2>
            <div
              className="text-5xl md:text-6xl font-bold tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-lime-500 dark:from-green-400 dark:to-lime-400"
              aria-live="polite"
            >
              {formatStopwatchTime(stopwatchTime)}
            </div>
            <div className="flex gap-4">
              <Button
                onClick={isStopwatchRunning ? handleStopwatchPause : handleStopwatchStart}
                className="bg-gradient-to-r from-green-500 to-lime-500 text-white hover:from-green-600 hover:to-lime-600 shadow-md"
              >
                {isStopwatchRunning ? "Pause" : "Start"}
              </Button>
              <Button
                onClick={handleStopwatchLap}
                variant="outline"
                className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 dark:border-green-400 dark:text-green-400 dark:hover:bg-gray-700 dark:hover:text-green-300 shadow-md bg-transparent"
                disabled={!isStopwatchRunning}
              >
                Lap
              </Button>
              <Button
                onClick={handleStopwatchReset}
                variant="outline"
                className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 dark:border-green-400 dark:text-green-400 dark:hover:bg-gray-700 dark:hover:text-green-300 shadow-md bg-transparent"
              >
                Reset
              </Button>
            </div>
            {laps.length > 0 && (
              <div className="w-full max-h-40 overflow-y-auto mt-4 p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Laps</h3>
                <ul className="space-y-1">
                  {laps.map((lap, index) => (
                    <li
                      key={index}
                      className="flex justify-between text-gray-600 dark:text-gray-300 text-sm tabular-nums"
                    >
                      <span>Lap {index + 1}:</span>
                      <span>{formatStopwatchTime(lap)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
