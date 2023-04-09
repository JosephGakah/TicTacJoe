import React, { useState } from "react";
import styled from "styled-components";
import { DIMENSIONS, PLAYER_X, PLAYER_O, SQUARE_DIMS, GAME_STATES } from "../constants";
import { getRandomInt, switchPlayer } from "../utils/utils";
 
const emptyGrid = new Array(DIMENSIONS ** 2).fill(null);
 
const TicTacToe = () => {
    const [grid, setGrid] = useState(emptyGrid)
    const [gameState, setGameState] = useState('')
    const [players, setPlayers] = useState<Record<string, number | null>>({
        human: null,
        ai: null
    })

    const choosePlayer = (option: number) => {
        setPlayers({ human: option, ai: switchPlayer(option) });
        setGameState(GAME_STATES.inProgress);
    };
 
    const move = (index: number, player: number | null) => {
        if(player !== null){
            setGrid((grid) => {
              const gridCopy = grid.concat();
              gridCopy[index] = player;
              return gridCopy;
            });
        }
    };
    
    const humanMove = (index: number) => {
        if (!grid[index]) {
            move(index, players.human);
            aiMove();
        }
    };

    const aiMove = () => {
        let index = getRandomInt(0, 8);
        while (grid[index]) {
            index = getRandomInt(0, 8);
        }
        move(index, players.ai);
    };

    return gameState == GAME_STATES.notStarted ? (
        <div>
          <Inner>
            <p>Choose your player</p>
            <ButtonRow>
              <button onClick={() => choosePlayer(PLAYER_X)}>X</button>
              <p>or</p>
              <button onClick={() => choosePlayer(PLAYER_O)}>O</button>
            </ButtonRow>
          </Inner>
        </div>
      )
    
    : (
        <Container dims={DIMENSIONS}>
            {grid.map((value, index) => {
            const isActive = value !== null;
    
            return (
                <Square key={index} onClick={() => humanMove(index)}>
                {isActive && <Marker>{value === PLAYER_X ? "X" : "O"}</Marker>}
                </Square>
            );
            })}
        </Container>
    )
}

const Container = styled.div<{ dims: number }>`
  display: flex;
  justify-content: center;
  width: ${({ dims }) => `${dims * (SQUARE_DIMS + 5)}px`};
  flex-flow: wrap;
  position: relative;
`;
 
const Square = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${SQUARE_DIMS}px;
  height: ${SQUARE_DIMS}px;
  border: 1px solid black;
 
  &:hover {
    cursor: pointer;
  }
`;
 
const Marker = styled.p`
  font-size: 68px;
`;
 
const ButtonRow = styled.div`
  display: flex;
  width: 150px;
  justify-content: space-between;
`;
 
const Inner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;

export default TicTacToe;