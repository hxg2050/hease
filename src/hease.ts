import { EASE } from "./ease";

/**
 * 简易刷新器
 */
const update = (callback: Function) => {
    let lastTime = performance.now();
    let animationFrame: number;
    const run = () => {
        callback(performance.now() - lastTime);
        lastTime = performance.now();
        animationFrame = requestAnimationFrame(() => run());
    }

    run();

    return () => {
        cancelAnimationFrame(animationFrame);
    }
}

type EasingUpdateFunc<T> = (newVal: T, dx: T) => void;

/**
 * 
 * @param from 起始值
 * @param to 目标值
 * @param duration 时长
 * @param ease 缓动函数
 * @returns 
 */
export const hease = <T extends number | number[]>(from: T, to: T, duration = 1000, ease = EASE.linear) => {
    const f: number[] = typeof from === 'number' ? [from] : from;
    const t: number[] = typeof to === 'number' ? [to] : to;
    const len = t.length;

    const pieces = t.map((value, index) => value - f[index]);
    const lasts = new Array(len).fill(0);

    let updateCallback: EasingUpdateFunc<T>;
    let completeCallback: Function;

    let stopUpdate: Function;

    let timeout: number | NodeJS.Timeout;

    const actions = {
        /**
         * 播放完成事件
         */
        onComplete: (callback: Function) => {
            completeCallback = callback;
            return actions;
        },
        /**
         * 更新事件
         */
        onUpdate: (callback: EasingUpdateFunc<T>) => {
            updateCallback = callback;
            return actions;
        },
        /**
         * 更新
         */
        update: (progress: number | true) => {

            const data = new Array<number>(len * 2);

            if (progress === true) {
                for (let i = 0; i < len; i++) {
                    data[i] = t[i];
                    data[len + i] = pieces[i] - lasts[i];
                }
            } else {
                const px = ease(progress);
                for (let i = 0; i < len; i++) {
                    const nx = px * pieces![i];
                    data[i] = f[i] + nx;
                    data[len + i] = nx - lasts[i];
                    lasts[i] = nx;
                }
            }

            if (typeof from === 'number') {
                (updateCallback! as EasingUpdateFunc<number>)(data[0], data[1]);
            } else {
                (updateCallback! as EasingUpdateFunc<number[]>)(data.slice(0, len), data.slice(len));
            }
        },
        /**
         * 开始
         */
        play: () => {
            if (!updateCallback) {
                return actions;
            }
            let passTime = 0;
            stopUpdate = update((dt: number) => {
                passTime += dt;
                const progress = Math.min(passTime / duration, 1);
                actions.update(progress);
            });

            timeout = setTimeout(() => {
                actions.complete();
            }, duration);

            return actions;
        },
        /**
         * 立即完成
         */
        complete: () => {
            completeCallback && completeCallback();
            actions.update(true);
            actions.stop();
            return actions;
        },
        /**
         * 停止
         */
        stop: () => {
            stopUpdate && stopUpdate();
            clearTimeout(timeout);
            return actions;
        }
    }
    return actions;
}