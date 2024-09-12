"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import s from "./SnakeComponent.module.scss";
import NextImage from "next/image";

const gridSize = 30;
const tileSize = 25;
const spriteSegment = 64;
type Direction = "LEFT" | "RIGHT" | "UP" | "DOWN";

const SnakeComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [snake, setSnake] = useState([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
  ]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, _] = useState(localStorage.getItem("high-score"));
  const [inputQueue, setInputQueue] = useState<Direction[] | []>([]);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [snakeImage, setSnakeImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = "snake-sprite.png";
    img.onload = () => setSnakeImage(img);
  }, []);

  useEffect(() => {
    const keyPush = (e: KeyboardEvent) => {
      if (e.key === " ") {
        setIsPaused(!isPaused);
        return;
      }
      const newDirection = getDirectionFromKey(e.key);
      if (newDirection && !isOppositeDirection(newDirection, direction)) {
        setInputQueue((prevQueue) => [...prevQueue, newDirection]);
      }
    };
    window.addEventListener("keydown", keyPush);
    return () => window.removeEventListener("keydown", keyPush);
  }, [direction, inputQueue, isPaused]);

  const getDirectionFromKey = (key: string) => {
    switch (key) {
      case "ArrowUp":
        return "UP";
      case "ArrowDown":
        return "DOWN";
      case "ArrowLeft":
        return "LEFT";
      case "ArrowRight":
        return "RIGHT";
      default:
        return null;
    }
  };

  const isOppositeDirection = (
    newDirection: string,
    currentDirection: string
  ) => {
    switch (newDirection) {
      case "UP":
        return currentDirection === "DOWN";
      case "DOWN":
        return currentDirection === "UP";
      case "LEFT":
        return currentDirection === "RIGHT";
      case "RIGHT":
        return currentDirection === "LEFT";
      default:
        return false;
    }
  };

  const generateUniqueFoodPosition = useCallback((): {
    x: number;
    y: number;
  } => {
    let newPosition: { x: number; y: number } = { x: 5, y: 5 };
    let isPositionValid = false;

    while (!isPositionValid) {
      newPosition = generateRandomPosition();

      // Проверяем, не совпадают ли новые координаты с координатами объектов в массиве
      isPositionValid = !snake.some(
        (object) => object.x === newPosition.x && object.y === newPosition.y
      );
    }

    return newPosition;
  }, [snake]);

  const endGame = useCallback(() => {
    setGameOver(true);
    if (!highScore || score > +highScore) {
      localStorage.setItem("high-score", `${score}`);
    }
  }, [highScore, score]);

  const updateSnake = useCallback(() => {
    const newSnake = [...snake];
    const head = [...snake][0];
    const newHead = { x: 0, y: 0 };
    const nextDirection = inputQueue.length > 0 ? inputQueue[0] : direction;
    if (inputQueue.length > 0) {
      setInputQueue((prevQueue) => prevQueue.slice(1));
    }
    switch (nextDirection) {
      case "LEFT":
        newHead.x = head.x - 1;
        newHead.y = head.y;
        break;
      case "UP":
        newHead.y = head.y - 1;
        newHead.x = head.x;
        break;
      case "RIGHT":
        newHead.x = head.x + 1;
        newHead.y = head.y;
        break;
      case "DOWN":
        newHead.y = head.y + 1;
        newHead.x = head.x;
        break;
      default:
        break;
    }

    if (
      newHead.x < 0 ||
      newHead.x >= gridSize ||
      newHead.y < 0 ||
      newHead.y >= gridSize
    ) {
      endGame();
    }
    for (let i = 1; i < snake.length; i++) {
      if (snake[i].x === newHead.x && snake[i].y === newHead.y) {
        endGame();
      }
    }

    newSnake.unshift(newHead);

    // Check if snake eats the food
    if (newHead.x === food.x && newHead.y === food.y) {
      setScore((oldScore) => oldScore + 1);
      setFood(generateUniqueFoodPosition);
    } else {
      newSnake.pop(); // Remove the last part of the snake if no food was eaten
    }

    setSnake(newSnake);
    setDirection(nextDirection);
  }, [
    direction,
    endGame,
    food.x,
    food.y,
    generateUniqueFoodPosition,
    inputQueue,
    snake,
  ]);

  // Set random coordinates to place food
  const generateRandomPosition = (): { x: number; y: number } => {
    return {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  };

  const drawSnakeSegment = useCallback(
    (
      context: CanvasRenderingContext2D,
      segment: { x: number; y: number },
      prevSegmenet: { x: number; y: number },
      nextSegment: { x: number; y: number },
      isHead: boolean,
      isTail: boolean
    ) => {
      const { x, y } = segment;

      if (snakeImage) {
        let spriteX = 0,
          spriteY = 0;

        if (isHead) {
          switch (direction) {
            case "LEFT":
              spriteX = 192;
              spriteY = 64;
              break;
            case "UP":
              spriteX = 192;
              spriteY = 0;
              break;
            case "RIGHT":
              spriteX = 256;
              spriteY = 0;
              break;
            case "DOWN":
              spriteX = 256;
              spriteY = 64;
              break;
            default:
              break;
          }
        } else if (isTail) {
          if (snake.length === 2) {
            switch (direction) {
              case "LEFT":
                spriteX = 192;
                spriteY = 192;
                break;
              case "UP":
                spriteX = 192;
                spriteY = 128;
                break;
              case "RIGHT":
                spriteX = 256;
                spriteY = 128;
                break;
              case "DOWN":
                spriteX = 256;
                spriteY = 192;
                break;
              default:
                break;
            }
          } else {
            if (prevSegmenet.y < segment.y) {
              spriteX = 192;
              spriteY = 128;
            } else if (prevSegmenet.x > segment.x) {
              spriteX = 256;
              spriteY = 128;
            } else if (prevSegmenet.y > segment.y) {
              spriteX = 256;
              spriteY = 192;
            } else if (prevSegmenet.x < segment.x) {
              spriteX = 192;
              spriteY = 192;
            }
          }
        } else {
          if (
            (prevSegmenet.x < segment.x && nextSegment.x > segment.x) ||
            (nextSegment.x < segment.x && prevSegmenet.x > segment.x)
          ) {
            //horizontal
            spriteX = 64;
            spriteY = 0;
          } else if (
            (prevSegmenet.x > segment.x && nextSegment.y > segment.y) ||
            (nextSegment.x > segment.x && prevSegmenet.y > segment.y)
          ) {
            spriteX = 0;
            spriteY = 0;
          } else if (
            (prevSegmenet.y < segment.y && nextSegment.y > segment.y) ||
            (nextSegment.y < segment.y && prevSegmenet.y > segment.y)
          ) {
            //vertical
            spriteX = 128;
            spriteY = 64;
          } else if (
            (prevSegmenet.y > segment.y && nextSegment.x < segment.x) ||
            (nextSegment.y > segment.y && prevSegmenet.x < segment.x)
          ) {
            spriteX = 128;
            spriteY = 0;
          } else if (
            (prevSegmenet.x > segment.x && nextSegment.y < segment.y) ||
            (nextSegment.x > segment.x && prevSegmenet.y < segment.y)
          ) {
            spriteX = 0;
            spriteY = 64;
          } else if (
            (prevSegmenet.y < segment.y && nextSegment.x < segment.x) ||
            (nextSegment.y < segment.y && prevSegmenet.x < segment.x)
          ) {
            spriteX = 128;
            spriteY = 128;
          }
        }

        const width = tileSize;
        const height = tileSize;

        context.drawImage(
          snakeImage,
          spriteX,
          spriteY,
          spriteSegment,
          spriteSegment,
          x * tileSize,
          y * tileSize,
          width,
          height
        );
      }
    },
    [direction, snake.length, snakeImage]
  );

  const draw = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    snake.forEach((segment, index) => {
      const isHead = index === 0;
      const isTail = index === snake.length - 1;
      drawSnakeSegment(
        ctx,
        segment,
        snake[index - 1],
        snake[index + 1],
        isHead,
        isTail
      );
    });

    if (snakeImage) {
      ctx.drawImage(
        snakeImage,
        0,
        192,
        spriteSegment,
        spriteSegment,
        food.x * tileSize,
        food.y * tileSize,
        tileSize,
        tileSize
      );
    }
  }, [drawSnakeSegment, food.x, food.y, snake, snakeImage]);

  const game = useCallback(() => {
    updateSnake();
    draw();
  }, [draw, updateSnake]);

  useEffect(() => {
    if (gameOver || isPaused) {
      return;
    }
    // draw();
    const timeout = setTimeout(() => {
      game();
    }, 100);

    return () => clearTimeout(timeout);
  }, [snake, direction, inputQueue, gameOver, game, isPaused]);

  const restoreInitialValues = () => {
    setDirection("RIGHT");
    setSnake([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
    ]);
    setFood({ x: 5, y: 5 });
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setInputQueue([]);
  };

  const restart = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    restoreInitialValues();
  };

  return (
    <div className={`${s.wrapper} font-sans text-stone-950`}>
      <div
        className={s.board}
        style={{
          width: `${gridSize * tileSize + 30}px`,
          height: `${gridSize * tileSize + 30}px`,
        }}
      >
        <div className="flex flex-1 justify-between items-center font-medium">
          <div className={s.score}>
            <NextImage alt="apple" src="/apple.png" width={30} height={30} />
            Score: {score}
          </div>

          <div className={s.score}>
            <NextImage alt="trophy" src="/trophy.svg" width={30} height={30} />
            High score: {highScore}
          </div>
        </div>
        {(gameOver || isPaused) && (
          <div className={s.overlay}>
            <div className={s["end-popup"]}>
              {gameOver ? (
                <>
                  <p className={`${s.title} font-semibold text-3xl text-red-600 text-center`}>Game over</p>
                  <div className={s.score}>
                    <NextImage
                      alt="apple"
                      src="/apple.png"
                      width={30}
                      height={30}
                    />
                    Score: {score}
                  </div>

                  <div className={s.score}>
                    <NextImage
                      alt="trophy"
                      src="/trophy.svg"
                      width={30}
                      height={30}
                    />
                    High score: {highScore}
                  </div>
                  <button
                    type="button"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded mt-2"
                    onClick={restart}
                  >
                    Restart
                  </button>
                </>
              ) : (
                <div className="font-semibold text-3xl text-center text-red-600">
                  Paused <p className="mt-3 font-normal text-xl text-center text-stone-950  ">Press spacebar to resume game</p>
                </div>
              )}
            </div>
          </div>
        )}
        <canvas
          className={s.canvas}
          ref={canvasRef}
          id="gc"
          width={gridSize * tileSize}
          height={gridSize * tileSize}
        ></canvas>
      </div>
    </div>
  );
};

export default SnakeComponent;
