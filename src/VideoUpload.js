import React, { useState, useEffect, useRef } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

function VideoUpload() {
  const [videoSrc, setVideoSrc] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [detector, setDetector] = useState(null);
  const [laps, setLaps] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [fps, setFps] = useState(30);
  const [lastLapTime, setLastLapTime] = useState(null);

  const [athleteName, setAthleteName] = useState("");
  const [practiceMenu, setPracticeMenu] = useState("");
  const [attemptNumber, setAttemptNumber] = useState("");

  const [accents, setAccents] = useState([]);
  const [allFramesKeypoints, setAllFramesKeypoints] = useState([]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
    }
  };

  useEffect(() => {
    const initTensorFlow = async () => {
      await tf.ready();
      await tf.setBackend('webgl');
      console.log("TensorFlow backend initialized.");
    };

    const initPoseDetection = async () => {
      const model = poseDetection.SupportedModels.MoveNet;
      const detectorConfig = { modelType: 
poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
      const newDetector = await poseDetection.createDetector(model, 
detectorConfig);
      setDetector(newDetector);
      console.log("Pose detector initialized.");
    };

    initTensorFlow().then(() => {
      initPoseDetection();
    });
  }, []);

  const handleTimeUpdate = async () => {
    if (detector && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      const poses = await detector.estimatePoses(video);
      drawLandmarks(context, poses);

      // Save keypoints for the current frame
      setAllFramesKeypoints((prevKeypoints) => [
        ...prevKeypoints,
        { time: video.currentTime, keypoints: poses[0]?.keypoints || [] }
      ]);
    }
  };

  const drawLandmarks = (context, poses) => {
    poses.forEach((pose) => {
      pose.keypoints.forEach((keypoint) => {
        if (keypoint.score > 0.3) {
          context.beginPath();
          context.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
          context.fillStyle = "red";
          context.fill();
        }
      });
    });
  };

  const handleStart = () => {
    const video = videoRef.current;
    setStartTime(video.currentTime);
    setLastLapTime(video.currentTime);
    setLaps([]);
  };

  const handleLap = () => {
    const video = videoRef.current;
    const currentTime = video.currentTime;
    const lapTime = currentTime - lastLapTime;
    const splitTime = currentTime - startTime;
    setLaps([...laps, { lapTime, splitTime }]);
    setLastLapTime(currentTime);
  };

  const handleStop = () => {
    const video = videoRef.current;
    const currentTime = video.currentTime;
    const lapTime = currentTime - lastLapTime;
    const splitTime = currentTime - startTime;
    setLaps([...laps, { lapTime, splitTime }]);
    setStartTime(null);
    setLastLapTime(null);
  };

  const stepForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 1 / fps;
    }
  };

  const stepBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 1 / fps;
    }
  };

  const handleAddAccent = () => {
    if (allFramesKeypoints.length > 0) {
      const latestKeypoints = allFramesKeypoints[allFramesKeypoints.length 
- 1];
      setAccents([...accents, { time: latestKeypoints.time, keypoints: latestKeypoints.keypoints }]);
    }
  };

const exportData = () => {
  const date = new Date();
  const formattedDate = date.toLocaleDateString();
  const formattedTime = date.toLocaleTimeString();

  // ファイルヘッダー部分
  let csvContent =
    `Athlete Name,Practice Menu,Attempt Number,Date,Time\n` +
    
`${athleteName},${practiceMenu},${attemptNumber},${formattedDate},${formattedTime}\n\n` 
+
    `Lap Data\n` +
    `Lap,Split Time (s),Lap Time (s)\n`;

  // ラップタイムデータ
  csvContent += laps
    .map((lap, index) => `Lap ${index + 
1},${lap.splitTime.toFixed(3)},${lap.lapTime.toFixed(3)}`)
    .join("\n");

  // キーポイントデータのヘッダー
  csvContent += `\n\nKeypoints Data\nTime (s),Body Part,X,Y,Score\n`;

  // 全フレームのキーポイントデータ
  allFramesKeypoints.forEach((frame) => {
    frame.keypoints.forEach((keypoint) => {
      csvContent += 
`${frame.time.toFixed(2)},${keypoint.name},${keypoint.x.toFixed(2)},${keypoint.y.toFixed(2)},${keypoint.score.toFixed(2)}\n`;
    });
  });

  // ファイルダウンロード処理
  const encodedUri = 
encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", 
`${athleteName}_${practiceMenu}_attempt${attemptNumber}_data.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  return (
    <div>
      <h2>Video Upload Component</h2>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      {videoSrc && (
        <>
          <div style={{ position: "relative", width: "640px", margin: 
"20px auto" }}>
            <video
              ref={videoRef}
              controls
              width="100%"
              src={videoSrc}
              onTimeUpdate={handleTimeUpdate}
              style={{ border: "1px solid black" }}
            />
            <canvas ref={canvasRef} width="640" height="360" style={{ 
position: "absolute", top: 0, left: 0 }}></canvas>
          </div>
          <div>
            <label>
              Athlete Name:
              <input type="text" value={athleteName} onChange={(e) => 
setAthleteName(e.target.value)} />
            </label>
            <label>
              Practice Menu:
              <input type="text" value={practiceMenu} onChange={(e) => 
setPracticeMenu(e.target.value)} />
            </label>
            <label>
              Attempt Number:
              <input type="number" value={attemptNumber} onChange={(e) => 
setAttemptNumber(e.target.value)} />
            </label>
          </div>
          <div>
            <button onClick={handleStart}>Start Stopwatch</button>
            <button onClick={handleLap}>Lap</button>
            <button onClick={handleStop}>Stop Stopwatch</button>
          </div>
          <ul>
            {laps.map((lap, index) => (
              <li key={index}>
                Lap {index + 1}: {lap.lapTime.toFixed(3)}s (Split: 
{lap.splitTime.toFixed(3)}s)
              </li>
            ))}
          </ul>
          <div>
            <button onClick={stepBackward}>Step Backward (1 
Frame)</button>
            <button onClick={stepForward}>Step Forward (1 Frame)</button>
          </div>
          <div>
            <button onClick={handleAddAccent}>Add Accent</button>
          </div>
          <button onClick={exportData}>Export Data</button>
        </>
      )}
    </div>
  );
}

export default VideoUpload;

