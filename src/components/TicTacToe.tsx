import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { DIMENSIONS, PLAYER_X, PLAYER_O, SQUARE_DIMS, GAME_STATES, DRAW, GAME_MODES } from "../constants";
import Board from "./Board";
import { getRandomInt, switchPlayer, minimax } from "../utils/utils";
import { border } from "../styles";
 
const emptyGrid = new Array(DIMENSIONS ** 2).fill(null); 
const board = new Board();
 
const TicTacToe = () => {
    const [grid, setGrid] = useState(emptyGrid)
    const [gameState, setGameState] = useState(GAME_STATES.notStarted)
    const [players, setPlayers] = useState<Record<string, number | null>>({human: null, ai: null})
    const [mode, setMode] = useState(GAME_MODES.medium)
    const [nextMove, setNextMove] = useState<null|number>(null)
    const [winner, setWinner] = useState<null | string>(null);
    const [isOver, setIsOver] = useState(false)

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
      // Important to pass a copy of the grid here
      const board = new Board(grid.concat());
      const emptyIndices = board.getEmptySquares(grid);
      let index;
      switch (mode) {
        case GAME_MODES.easy:
          do {
            index = getRandomInt(0, 8);
          } while (!emptyIndices.includes(index));
          break;
        // Medium level is approx. half of the moves are Minimax and the other half random
        case GAME_MODES.medium:
          const smartMove = !board.isEmpty(grid) && Math.random() < 0.5;
          if (smartMove) {
            index = minimax(board, players.ai!)[1];
          } else {
            do {
              index = getRandomInt(0, 8);
            } while (!emptyIndices.includes(index));
          }
          break;
        case GAME_MODES.difficult:
        default:
          index = board.isEmpty(grid)
            ? getRandomInt(0, 8)
            : minimax(board, players.ai!)[1];
      }
      
      if (index && !grid[index]) {
        if (players.ai !== null) {
          move(index, players.ai);
        }
        setNextMove(players.human);
      }
    }, [move, grid, players, mode]);

    const startNewGame = () => {
      setIsOver(false)
      setGameState(GAME_STATES.notStarted);
      setGrid(emptyGrid);
    };

    const changeMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setMode(e.target.value);
    };

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if ( nextMove !== null && nextMove === players.ai && gameState !== GAME_STATES.over ) {
          // Delay AI moves to make them seem more natural
          timeout = setTimeout(() => {
            aiMove();
          }, 500);
        }
        return () => timeout && clearTimeout(timeout);

        }, [nextMove, aiMove, players.ai, gameState]
    );

    useEffect(() => {
        const boardWinner = board.getWinner(grid);
        const declareWinner = (winner: number) => {
          let winnerStr = "";
          switch (winner) {
            case PLAYER_X:
              winnerStr = "Player X wins!";
              break;
            case PLAYER_O:
              winnerStr = "Player O wins!";
              break;
            case DRAW:
            default:
              winnerStr = "It's a draw";
          }
          setIsOver(true);
          setTimeout(() => {
            setGameState(GAME_STATES.over);
            setWinner(winnerStr);
          }, 1000);
        };
     
        if (boardWinner !== null && gameState !== GAME_STATES.over) {
          declareWinner(boardWinner);
        }
        }, [gameState, grid, nextMove]
    );
    
    switch (gameState) {
        case GAME_STATES.notStarted:
        default:
            return (
                <div>
                <Inner>
                    <p>Select difficulty</p>
                    <select onChange={changeMode} value={mode}>
                      {Object.keys(GAME_MODES).map(key => {
                        const gameMode = GAME_MODES[key];
                        return (
                          <option key={gameMode} value={gameMode}>
                            {key}
                          </option>
                        );
                      })}
                    </select>
                    <p>Choose your player</p>
                    <ButtonRow>
                    <button onClick={() => choosePlayer(PLAYER_X)}>X</button>
                    <p>or</p>
                    <button onClick={() => choosePlayer(PLAYER_O)}>O</button>
                    </ButtonRow>
                </Inner>
                </div>
            );
            
        case GAME_STATES.inProgress:
            return (
                <Container dims={DIMENSIONS}>
                  {grid.map((value, index) => {
                      const isActive = value !== null;
          
                      return (
                      <Square
                          key={index}
                          onClick={() => humanMove(index)}
                      >
                          {isActive && <Marker>{value === PLAYER_X ? "X" : "O"}</Marker>}
                      </Square>
                      );
                  })}

                  <Strikethrough
                    styles={
                      isOver ? board.getStrikethroughStyles() : ""
                    }
                  />

                </Container>
            );

        case GAME_STATES.over:
            return (
                <div>
                <p>{winner}</p>
                <button onClick={startNewGame}>Start over</button>
                </div>
            );
    }

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
  ${border}; // Adding new border styles
 
  &:hover {
    cursor: pointer;
  }
`;
 
 
const Strikethrough = styled.div<{ styles: string | null }>`
  position: absolute;
  ${({ styles }) => styles}
  background-color: indianred;
  height: 5px;
  width: ${({ styles }) => !styles && "0px"};
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