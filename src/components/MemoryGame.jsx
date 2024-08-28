import React, { useState, useEffect } from "react";
import Card from "./Card";
import "../css/memoryGame.css";
import image1 from "../assets/image1.jpg";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/image3.jpg";
import image4 from "../assets/image4.jpg";
import image5 from "../assets/image5.jpg";
import image6 from "../assets/image6.jpg";

const generateCards = (rows, cols) => {
  const totalCards = rows * cols;
  if (totalCards % 2 !== 0) return [];
  const images = [image1, image2, image3, image4, image5, image6];
  const cardImages = images.slice(0, totalCards / 2);
  const cardValues = [...cardImages, ...cardImages].sort(
    () => Math.random() - 0.5
  );

  return cardValues;
};

const getGridSize = (level) => {
  const gridSizes = { 1: [2, 2], 2: [2, 3], 3: [3, 4] };
  return gridSizes[level] || [2, 2];
};

const MemoryGame = () => {
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (gameOver) return;

    const [rows, cols] = getGridSize(level);
    const newCards = generateCards(rows, cols);

    if (newCards.length > 0) {
      setCards(newCards);
      setFlippedCards([]);
      setMatchedCards([]);
      setInitialized(true);
    }
  }, [level, gameOver]);

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
      if (level < 3) {
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

  const [rows, cols] = getGridSize(level);

  return (
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
  );
};

export default MemoryGame;
