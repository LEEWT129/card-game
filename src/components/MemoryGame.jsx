import React, { useState, useEffect } from "react";
import Card from "./Card";
import UploadModal from "./UploadModal";
import "../css/memoryGame.css";
import { saveImage, getImages } from "../utils/idbHelper";
import { defaultImages } from "../assets/images";

// 隨機化圖片列表
const shuffleImages = (images) => {
  let shuffled = [...images];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const generateCards = (images) => {
  const cardImages = [...images, ...images].sort(() => Math.random() - 0.5);
  return cardImages;
};

const getGridSize = (level) => {
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  const gridSizes = isMobile
    ? { 1: [2, 2], 2: [2, 3], 3: [4, 3], 4: [6, 3], 5: [8, 3] }
    : { 1: [2, 2], 2: [2, 3], 3: [3, 4], 4: [3, 6], 5: [4, 6] };

  return gridSizes[level] || [2, 2];
};

const MemoryGame = () => {
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      const storedImages = await getImages();
      if (storedImages.length > 0) {
        setImages(storedImages);
      } else {
        // Randomize the default images and set them
        setImages(shuffleImages(defaultImages));
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    if (gameOver) return;

    const [rows, cols] = getGridSize(level);
    const neededImageCount = (rows * cols) / 2;

    // Ensure we shuffle the images every time we set new ones
    const availableImages = shuffleImages(images).slice(0, neededImageCount);
    const additionalImages = shuffleImages(defaultImages).slice(
      0,
      Math.max(0, neededImageCount - availableImages.length)
    );
    const finalImages = [...availableImages, ...additionalImages];

    const newCards = generateCards(shuffleImages(finalImages));

    if (newCards.length > 0) {
      setCards(newCards);
      setFlippedCards([]);
      setMatchedCards([]);
      setInitialized(true);
    }
  }, [level, gameOver, images]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstIndex, secondIndex] = flippedCards;
      if (cards[firstIndex] === cards[secondIndex]) {
        setMatchedCards((prevMatched) => [
          ...prevMatched,
          firstIndex,
          secondIndex,
        ]);
      }
      const timer = setTimeout(() => setFlippedCards([]), 1000);
      return () => clearTimeout(timer);
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    if (
      initialized &&
      matchedCards.length === cards.length &&
      cards.length > 0
    ) {
      if (level < 5) {
        alert(`第 ${level} 關已完成！`);
        setTimeout(() => {
          setInitialized(false);
          setLevel((prevLevel) => prevLevel + 1);
        }, 500);
      } else {
        setGameOver(true);
        alert("恭喜！你已完成所有關卡！");
      }
    }
  }, [matchedCards, cards, level, initialized]);

  const handleCardClick = (index) => {
    if (
      flippedCards.length < 2 &&
      !flippedCards.includes(index) &&
      !matchedCards.includes(index)
    ) {
      setFlippedCards((prevFlipped) => [...prevFlipped, index]);
    }
  };

  const handleUpload = async (newImages) => {
    await Promise.all(newImages.map((image) => saveImage(image)));
    const updatedStoredImages = await getImages();
    setImages(updatedStoredImages);

    setModalOpen(false);
  };

  const [rows, cols] = getGridSize(level);

  return (
    <div style={{ textAlign: "center" }}>
      <button className="upload-btn" onClick={() => setModalOpen(true)}>
        自訂圖片
      </button>
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onUpload={handleUpload}
      />
      <div
        className="game-board"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridAutoRows: `minmax(100px, auto)`,
        }}
      >
        {cards.map((card, index) => (
          <Card
            key={index}
            card={card}
            onClick={() => handleCardClick(index)}
            isFlipped={
              flippedCards.includes(index) || matchedCards.includes(index)
            }
          />
        ))}
      </div>
    </div>
  );
};

export default MemoryGame;
