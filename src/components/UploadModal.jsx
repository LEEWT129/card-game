import React, { useState, useEffect, useRef } from "react";
import "../css/uploadModal.css";
import { saveImage, getImages, clearImages } from "../utils/idbHelper";

const UploadModal = ({ isOpen, onClose, onUpload }) => {
  const [previews, setPreviews] = useState([]);
  const [imagesToSave, setImagesToSave] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    // 取得圖片
    const loadImages = async () => {
      const savedImages = await getImages();
      setPreviews(savedImages.map((url, index) => ({ id: index, url })));
    };

    if (isOpen) {
      loadImages();
    }
  }, [isOpen]);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const imageDataURL = reader.result;
          resolve({ id: Date.now() + Math.random(), url: imageDataURL });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newPreviews).then((images) => {
      setPreviews((prev) => [...prev, ...images]);
      setImagesToSave((prev) => [...prev, ...images]);
    });
  };

  const handleRemoveImage = (id) => {
    const updatedPreviews = previews.filter((preview) => preview.id !== id);
    setPreviews(updatedPreviews);
    setImagesToRemove((prev) => [
      ...prev,
      previews.find((preview) => preview.id === id)?.url,
    ]);
  };

  const handleClearAll = () => {
    setPreviews([]);
    setImagesToRemove(previews.map((preview) => preview.url));
  };

  const handleUpload = async () => {
    for (const image of imagesToSave) {
      await saveImage(image.url);
    }

    await clearImages();
    for (const image of previews
      .filter((preview) => !imagesToRemove.includes(preview.url))
      .map((preview) => preview.url)) {
      await saveImage(image);
    }

    if (previews.length > 0) {
      const images = previews.map((preview) => preview.url);
      await onUpload(images);
    }
    setPreviews([]);
    setImagesToSave([]);
    setImagesToRemove([]);
    onClose();
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <h2>上傳圖片</h2>
        <button
          className="modal-select-file-btn"
          onClick={handleFileInputClick}
        >
          選擇圖片
        </button>
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
        <div className="image-preview-container">
          {previews.map((preview) => (
            <div key={preview.id} className="image-preview-wrapper">
              <img src={preview.url} alt="Preview" className="image-preview" />
              <button
                className="remove-image-btn"
                onClick={() => handleRemoveImage(preview.id)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <div className="button-group">
          <button className="modal-clear-all-btn" onClick={handleClearAll}>
            全部刪除
          </button>
          <button className="modal-upload-btn" onClick={handleUpload}>
            確定
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
