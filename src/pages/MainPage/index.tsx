/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import "./style.css";
import { FaMusic } from "react-icons/fa";
import { IoVideocam } from "react-icons/io5";
import { MdFileDownload } from "react-icons/md";
import { Circles } from "react-loader-spinner";
import { FaSearch } from "react-icons/fa";

function YTDownloader() {
  const [videoUrl, setVideoUrl] = useState("");
  const [formats, setFormats] = useState<any>([]);
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const API_URL = String(import.meta.env.VITE_API_URL);
  const USER_NAME = String(import.meta.env.VITE_USER_NAME);
  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const updateGreeting = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour >= 5 && hour < 12) {
        setGreeting("Good Morning");
      } else if (hour >= 12 && hour < 17) {
        setGreeting("Good Afternoon");
      } else if (hour >= 17 && hour < 21) {
        setGreeting("Good Evening");
      } else {
        setGreeting("Good Night");
      }
    };

    updateGreeting();
  }, []);
  const fetchFormats = async () => {
    setLoading(true);
    if (!videoUrl) {
      alert("Please enter a valid YouTube URL");
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/formats`, { videoUrl });
      setFormats([
        { type: "video", res: response.data?.video },
        { type: "audio", res: response.data?.audio }
      ]);
      console.log(response.data);
      setImageUrl(response.data.thumbnail);
      setMessage(`Available formats for: ${response.data.title}`);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching formats:", error);
      setMessage("Failed to fetch formats.");
      setLoading(false);
    }
  };
  console.log({ formats });
  const handleDownload = async (mediaType: string, formatId: string) => {
    if (!formatId) {
      alert("Please select a format");
      return;
    }
    try {
      const response = await axios({
        url: `${API_URL}/download`,
        method: "POST",
        data: { videoUrl, formatId: formatId }
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${mediaType} ${formatId}.mp4`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setMessage("Download completed successfully.");
    } catch (error: any) {
      console.error("Error downloading video:", error.message);
      setMessage("Failed to download the video.");
    }
  };

  return (
    <div className="container">
      <h3 className="greetings">{`${greeting} ${USER_NAME} !!`}</h3>
      <div
        style={{
          backgroundColor: "skyblue",
          width: "100%",
          borderRadius: "8px"
        }}
      >
        <div className="innercontainer">
          <h2 className="title">YouTube Video Downloader</h2>
          <p style={{ width: "80%" }}>
            download online videos, download online video for free
          </p>
          <input
            type="text"
            placeholder="Enter YouTube URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="inputbox"
          />
          <button onClick={fetchFormats} className="searchBtn">
            <FaSearch size={20} color="white" />
          </button>
          {loading ? (
            <div className="loadingdiv">
              <Circles
                height="80"
                width="80"
                color="skyblue"
                ariaLabel="circles-loading"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
              />
            </div>
          ) : (
            <>
              {formats.map((media: any, mediaIndex: number) => (
                <table
                  key={mediaIndex}
                  style={{
                    border: "1px solid black",
                    width: "90%",
                    borderCollapse: "collapse",
                    marginBottom: "20px"
                  }}
                >
                  <thead>
                    <tr>
                      <td
                        style={{
                          // borderBottom: "1px solid black",
                          width: "100%",
                          textAlign: "left",
                          fontWeight: "bold",
                          padding: "10px",
                          alignItems: "center",
                          display: "flex",
                          gap: "6px"
                        }}
                        colSpan={3}
                      >
                        {media.type === "audio" ? <FaMusic /> : <IoVideocam />}
                        <span> {media.type} </span>
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    {media.res.map((format: any, formatIndex: number) => (
                      <tr key={formatIndex}>
                        <td
                          style={{
                            width: "25%"
                          }}
                          className="td"
                        >
                          {media.type === "video"
                            ? `${format.resolution}.(${format.ext})`
                            : format.ext}
                        </td>
                        <td
                          style={{
                            width: "40%"
                          }}
                          className="td"
                        >
                          {media.type === "video"
                            ? `${format.size} MB`
                            : `${format.audio_bitrate}`}
                        </td>
                        <td
                          style={{
                            width: "50%"
                          }}
                          className="td"
                          onClick={() =>
                            handleDownload(media.type, format.format_id)
                          }
                        >
                          <div className="downloadButtonDiv">
                            <MdFileDownload size={20} />
                            <span>Download</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}
              {imageUrl && <img src={imageUrl} width={"90%"}></img>}

              {message && <p>{message}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default YTDownloader;
