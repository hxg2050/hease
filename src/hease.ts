import { EASE } from "./ease";

export interface Hease<T extends number | number[]> {
    // [props: string]: any;
    onComplete: (callback: Function) => this;
    onUpdate: (callback: EasingUpdateFunc<T>) => this;
    update: (progress: number) => void;
    play: (times?: number) => this
    complete: () => this
    stop: () => this
}

export type HEaseValue = number | number[];

type en<T, K> = never extends T ? K : never;


type a = en<never, number>;

// const he = new _Hease({
//     'from': [1],
//     'to': [1]
// });
// const he2 = he.from([1, 2]);//.to(1);
// he2.to(1);

export type HeaseTicker = (callback: (dt: number) => void) => () => void

/**
 * 简易刷新器
 */
const update = (callback: Parameters<HeaseTicker>[0]) => {
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

let ticker = update;

export const bindTicker = (fn: HeaseTicker) => {
    ticker = fn;
}

type EasingUpdateFunc<T> = (newVal: T, dx: T) => void;

export const createUpdate = (fn: (value: number) => void) => {
    let isPause = false;

    let stopHandler: ReturnType<HeaseTicker> | null = null;

    const stop = () => {
        isPause = true;
        stopHandler && stopHandler();
        stopHandler = null;
    }

    const play = () => {
        isPause = false;
        if (stopHandler) {
            return;
        }
        stopHandler = ticker((x) => {
            if (!isPause) {
                fn(x);
            }
        });
    }

    return {
        play,
        stop,
        isPause
    }
}

/**
 * 当动画运动到终点后，会继续再次以相反的运动方式运动到起点（溜溜球）
 * @param from 
 * @param to 
 * @param duration 
 * @param ease 
 */
export const yoyo = (ease = EASE.linear) => {
    // 记录方向:1 正向，-1反向
    let dir: 1 | -1 = -1;
    // 思路，时间翻倍
    const easeFn = (x: number) => {
        if (x === 0) {
            // 表示应该转向了
            dir = -1 * dir;
        }
        if (dir === 1) {
            return ease(x);
        } else {
            return ease(1 - x);
        }
    }
    return easeFn;
}

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

    let timeout: number | NodeJS.Timeout;

    let count = 1;

    let isPause = false;

    let passTime = 0;

    const { play, stop } = createUpdate((dt: number) => {
        passTime += dt;
        const progress = Math.min(passTime / duration, 1);
        actions.update(progress);
    });

    const finish = () => {
        if (isPause) {
            return actions;
        }
        actions.update(1);
        actions.stop();
        count--;
        if (count > 0) {
            passTime = 0;
            actions.play();
        } else {
            actions.complete();
        }
        return actions;
    }

    const actions: Hease<T> = {
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
         * @param progress 进度 0-1
         */
        update: (progress: number) => {

            const data = new Array<number>(len * 2);

            // if (progress === 1) {
            //     for (let i = 0; i < len; i++) {
            //         data[i] = t[i];
            //         data[len + i] = pieces[i] - lasts[i];
            //     }
            // } else {
            const px = ease(progress);
            for (let i = 0; i < len; i++) {
                const nx = px * pieces![i];
                data[i] = f[i] + nx;
                data[len + i] = nx - lasts[i];
                lasts[i] = nx;
            }
            // }

            if (typeof from === 'number') {
                (updateCallback! as EasingUpdateFunc<number>)(data[0], data[1]);
            } else {
                (updateCallback! as EasingUpdateFunc<number[]>)(data.slice(0, len), data.slice(len));
            }
        },
        /**
         * 开始
         * @param times 执行次数
         */
        play: (times?: number) => {
            if (times !== undefined) {
                count = times;
            }
            play();

            clearTimeout(timeout);
            timeout = setTimeout(() => {
                finish();
            }, duration - passTime);

            return actions;
        },
        /**
         * 立即完成
         * @param boolean sys 是否继续后续流程
         */
        complete: () => {
            actions.update(1);
            actions.stop();
            count = 0;
            passTime = 0;
            completeCallback && completeCallback();
            return actions;
        },
        /**
         * 停止
         */
        stop: () => {
            stop();
            clearTimeout(timeout);
            return actions;
        }
    }
    return actions;
}