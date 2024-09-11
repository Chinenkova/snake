'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const gridSize = 40;
const tileSize = 20;

type Direction = 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';

const SnakeComponent = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    let timer = useRef<NodeJS.Timeout | undefined>();
    const [direction, setDirection] = useState<Direction>('RIGHT');
    const [snake, setSnake] = useState([{ x: 10, y: 10 }, { x: 9, y: 10 }])
    const [food, setFood] = useState({ x: 5, y: 5 })
    const [score, setScore] = useState(0)
    const [inputQueue, setInputQueue] = useState<Direction[] | []>([]);
    const [gameOver, setGameOver] = useState(false)




    useEffect(() => {
        const keyPush = (e: KeyboardEvent) => {
            const newDirection = getDirectionFromKey(e.key);
            if (newDirection && !isOppositeDirection(newDirection, direction)) {
                setInputQueue((prevQueue) => [...prevQueue, newDirection]);
            }

        }
        window.addEventListener('keydown', keyPush);
        return () => window.removeEventListener('keydown', keyPush);

    }, [direction])

    const getDirectionFromKey = (key: string) => {
        switch (key) {
            case 'ArrowUp':
                return 'UP';
            case 'ArrowDown':
                return 'DOWN';
            case 'ArrowLeft':
                return 'LEFT';
            case 'ArrowRight':
                return 'RIGHT';
            default:
                return null;
        }
    };


    const isOppositeDirection = (newDirection: string, currentDirection: string) => {
        return newDirection === currentDirection;
    };


    const updateSnake = () => {
        const newSnake = [...snake];
        const head = [...snake][0];
        const newHead = { x: 0, y: 0 }
        const nextDirection = inputQueue.length > 0 ? inputQueue[0] : direction;
        if (inputQueue.length > 0) {
            setInputQueue((prevQueue) => prevQueue.slice(1));
        }
        switch (nextDirection) {
            case 'LEFT':
                newHead.x = head.x - 1
                newHead.y = head.y;
                break;
            case 'UP':
                newHead.y = head.y - 1
                newHead.x = head.x;
                break;
            case 'RIGHT':
                newHead.x = head.x + 1;
                newHead.y = head.y;
                break;
            case 'DOWN':
                newHead.y = head.y + 1
                newHead.x = head.x;
                break;
            default:
                break;
        }

        if (newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize) {
            setGameOver(true);
        }
        for (let i = 1; i < snake.length; i++) {
            if (snake[i].x === newHead.x && snake[i].y === newHead.y) {
                setGameOver(true);
            }
        }

        newSnake.unshift(newHead);

        // Check if snake eats the food
        if (newHead.x === food.x && newHead.y === food.y) {
            placeFood();
        } else {
            newSnake.pop(); // Remove the last part of the snake if no food was eaten
        }

        setSnake(newSnake);
        setDirection(nextDirection);
    }



    // Set random coordinates to place food
    const placeFood = () => {
        setFood({
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        });
    }

    const draw = () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        
        snake.forEach((s,i) => {
            if (i===0) {
                ctx.fillStyle = 'darkGreen';
                ctx.fillRect(s.x * tileSize, s.y * tileSize, tileSize, tileSize);
            } else {
                ctx.fillStyle = 'green';
                ctx.fillRect(s.x * tileSize, s.y * tileSize, tileSize, tileSize);
            }
            
        })

        ctx.fillStyle = 'red';
        ctx.fillRect(food.x * tileSize, food.y * tileSize, tileSize, tileSize);
    }


    const game = () => {
        updateSnake();
        draw();

    }


    useEffect(() => {
        if (gameOver) {
            return;
        }
        draw();
        const timeout = setTimeout(() => {
            game();
        }, 100);

        return () => clearTimeout(timeout);
    }, [snake, direction]);

    const endGame = () => {
        clearInterval(timer.current);
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasRef.current.clientWidth, canvasRef.current.clientHeight);
        restoreInitialValues();
    }

    const restoreInitialValues = () => {
        setDirection('RIGHT');
        setSnake([{ x: 10, y: 10 }]);
        setFood({ x: 5, y: 5 });
        setGameOver(false);
        setScore(0);
        placeFood();
        draw();
    }

    return (
        <div style={{position:'relative'}}>
            {gameOver &&
                <p style={{position: 'absolute', background: 'red', color: '#fff'}}>Game over</p>}
                <>
                    <canvas ref={canvasRef} id="gc" width={gridSize * tileSize} height={gridSize * tileSize} style={{ background: 'lightBlue' }}></canvas>
                    <div>{score}</div>
                </>
        </div>
    );
};

export default SnakeComponent;
