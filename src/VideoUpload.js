import React, { useState } from 'react';

function VideoUpload() {
  const [videoSrc, setVideoSrc] = useState(null);
  const [laps, setLaps] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [lastLapTime, setLastLapTime] = useState(null);
  const [fps, setFps] = useState(30);

  // 新しい入力フィールドの状態
  const [athleteName, setAthleteName] = useState("");
  const [practiceMenu, setPracticeMenu] = useState("");
  const [attemptNumber, setAttemptNumber] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
    }
  };

  const handleLoadedMetadata = (event) => {
    const videoElement = event.target;
    const frameRate = videoElement.frameRate || 30;
    setFps(frameRate);
  };

  const handleStart = () => {
    const videoElement = document.querySelector('video');
    const time = videoElement.currentTime;
    setStartTime(time);
    setLastLapTime(time);
    setLaps([]);
  };

  const handleLap = () => {
    const videoElement = document.querySelector('video');
    const currentTime = videoElement.currentTime;
    const lapTime = currentTime - lastLapTime;
    const splitTime = currentTime - startTime;

    setLaps([...laps, { lapTime, splitTime }]);
    setLastLapTime(currentTime);
  };

  const handleStop = () => {
    const videoElement = document.querySelector('video');
    const currentTime = videoElement.currentTime;
    const lapTime = currentTime - lastLapTime;
    const splitTime = currentTime - startTime;

    setLaps([...laps, { lapTime, splitTime }]);
    setStartTime(null);
    setLastLapTime(null);
  };

  const stepForward = () => {
    const videoElement = document.querySelector('video');
    videoElement.currentTime += 1 / fps;
  };

  const stepBackward = () => {
    const videoElement = document.querySelector('video');
    videoElement.currentTime -= 1 / fps;
  };

  const exportData = () => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();

    const csvContent = `data:text/csv;charset=utf-8,
Athlete Name,Practice Menu,Attempt Number,Date,Time\n${athleteName},${practiceMenu},${attemptNumber},${formattedDate},${formattedTime}\n\nLap,Split Time\n`
      + laps.map((lap, index) => `Lap ${index + 1},${lap.lapTime.toFixed(3)},${lap.splitTime.toFixed(3)}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${athleteName}_${practiceMenu}_attempt${attemptNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      {videoSrc && (
        <>
          <video controls width="100%" onLoadedMetadata={handleLoadedMetadata}>
            <source src={videoSrc} type="video/mp4" />
          </video>
          <div style={{ marginTop: '10px' }}>
            <label>
              Athlete Name:
              <input type="text" value={athleteName} onChange={(e) => setAthleteName(e.target.value)} />
            </label>
            <label>
              Practice Menu:
              <input type="text" value={practiceMenu} onChange={(e) => setPracticeMenu(e.target.value)} />
            </label>
            <label>
              Attempt Number:
              <input type="number" value={attemptNumber} onChange={(e) => setAttemptNumber(e.target.value)} />
            </label>
          </div>
          <div style={{ marginTop: '10px' }}>
            <button onClick={handleStart}>Start Stopwatch</button>
            <button onClick={handleLap}>Lap</button>
            <button onClick={handleStop}>Stop Stopwatch</button>
          </div>
          <ul>
            {laps.map((lap, index) => (
              <li key={index}>
                Lap {index + 1}: {lap.lapTime.toFixed(3)}s (Split: {lap.splitTime.toFixed(3)}s)
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '10px' }}>
            <button onClick={stepBackward}>Step Backward (1 Frame)</button>
            <button onClick={stepForward}>Step Forward (1 Frame)</button>
          </div>
          <button onClick={exportData} style={{ marginTop: '10px', fontWeight: 'bold' }}>Export Data</button>
        </>
      )}
    </div>
  );
}

export default VideoUpload;

