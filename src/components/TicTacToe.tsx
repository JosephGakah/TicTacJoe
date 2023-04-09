import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { DIMENSIONS, PLAYER_X, PLAYER_O, SQUARE_DIMS, GAME_STATES } from "../constants";
import { getRandomInt, switchPlayer } from "../utils/utils";
 
const emptyGrid = new Array(DIMENSIONS ** 2).fill(null);
 
const TicTacToe = () => {
    const [grid, setGrid] = useState(emptyGrid)
    const [gameState, setGameState] = useState(GAME_STATES.notStarted)
    const [players, setPlayers] = useState<Record<string, number | null>>({
        human: null,
        ai: null
    })

    const [nextMove, setNextMove] = useState<null|number>(null)

    const choosePlayer = (option: number) => {
        setPlayers({ human: option, ai: switchPlayer(option) });
        setGameState(GAME_STATES.inProgress);
        setNextMove(PLAYER_X)
    };
 
    const move = useCallback(
        (index: number, player: number | null) => {
          if (player && gameState === GAME_STATES.inProgress) {
            setGrid((grid) => {
              const gridCopy = grid.concat();
              gridCopy[index] = player;
              return gridCopy;
            });
          }
        },
        [gameState]
      );
    
    const humanMove = (index: number) => {
        if (!grid[index]) {
            move(index, players.human);
            setNextMove(players.ai);
        }
    };

    const aiMove = useCallback(() => {
        let index = getRandomInt(0, 8);
        while (grid[index]) {
          index = getRandomInt(0, 8);
        }
       
        move(index, players.ai);
        setNextMove(players.human);
       
    }, [move, grid, players]);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if ( nextMove !== null && nextMove === players.ai && gameState !== GAME_STATES.over ) {
          // Delay AI moves to make them seem more natural
          timeout = setTimeout(() => {
            aiMove();
          }, 500);
        }
        return () => timeout && clearTimeout(timeout);
    }, [nextMove, aiMove, players.ai, gameState]);
    

    return gameState === GAME_STATES.notStarted ? (
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