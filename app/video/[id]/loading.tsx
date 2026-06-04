// app/videos/[id]/loading.tsx
import './video.css'; // 👈 This "links" the styles

export default function Loading() {
  return (
    <div className="video-loader-overlay">
      <div className="video-loader-content">
        <div className="video-loader-spinner"></div>
        <p className="video-loader-text">Loading Video...</p>
      </div>
    </div>
  );
}