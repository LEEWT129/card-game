import React from 'react';
import '../css/card.css'; 


const Card = ({ card, onClick, isFlipped }) => {
    return (
      <div className="card" onClick={onClick}>
        {isFlipped ? (
          <img src={card} alt="card-front" className="card-front" /> 
        ) : (
          <div className="card-back"></div> 
        )}
      </div>
    );
  };
export default Card;