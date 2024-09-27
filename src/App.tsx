import { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";

function App() {
  const [loaded, setLoaded] = useState(false); 
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const messageRef = useRef<HTMLParagraphElement | null>(null)
  const selectedFile = useRef(undefined);

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      if (messageRef.current) messageRef.current.innerHTML = message;
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        "text/javascript"
      ),
    });
    setLoaded(true);
  };

  // const transcode = async () => {
  //   // const videoURL = "https://raw.githubusercontent.com/ffmpegwasm/testdata/master/video-15s.avi";
  //   let url = "";
  //   if(selectedFile)url = URL.createObjectURL(selectedFile);  // Convert the file to a URL
    
  //   const ffmpeg = ffmpegRef.current;
  //   await ffmpeg.writeFile("input.avi", await fetchFile(url));
  //   await ffmpeg.exec(["-i", "input.avi", "output.mp4"]);
  //   const fileData = await ffmpeg.readFile('output.mp4');
  //   const data = new Uint8Array(fileData as ArrayBuffer);
    
  //   if (videoRef.current) {
  //     videoRef.current.src = URL.createObjectURL(
  //       new Blob([data.buffer], { type: 'video/mp4' })
  //     )
  //   }
  //   const downloadURL = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
  //   const anchor = document.createElement('a');
  //   anchor.href = downloadURL;
  //   anchor.download = 'output.mp4';  // Set the file name for download
   
  //   anchor.click();  // Trigger download
    
  
  // };
  
  const handleFileUpload = async (event: any) => {
    selectedFile.current = event.target.files[0];
    if(!selectedFile.current) return;
    //  const videoURL = "https://raw.githubusercontent.com/ffmpegwasm/testdata/master/video-15s.avi";
    const videoURL = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile("input.mp4", await fetchFile(videoURL));
    await ffmpeg.exec(['-i',
            'input.webm',
            '-f',
            'segment',
            '-segment_time',
            '3',
            '-g',
            '9',
            '-sc_threshold',
            '0',
            '-force_key_frames',
            'expr:gte(t,n_forced*9)',
            '-reset_timestamps',
            '1',
            '-map',
            '0',
            'output_%d.mp4',
            'video/mp4', "input.mp4", "output.mp4"]);
    const fileData = await ffmpeg.readFile("output.mp4");
    const data = new Uint8Array(fileData as ArrayBuffer);
    
    if (videoRef.current) {
      videoRef.current.src = URL.createObjectURL(
        new Blob([data.buffer], { type: 'video/mp4' })
      )
    }
    const downloadURL = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    const anchor = document.createElement('a');
    anchor.href = downloadURL;
    anchor.download = 'output.mp4';  // Set the file name for download
   
    anchor.click();  // Trigger download

  } 
  return loaded ? (
    <>
      <video ref={videoRef} controls></video>
      <br />
      <input type="file" accept="video/*" onChange={handleFileUpload} />
     
      <p ref={messageRef}></p>
    </>
  ) : (
    <button onClick={load}>Load ffmpeg-core</button>
  );
}

export default App;
