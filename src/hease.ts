import { EASE } from "./ease";
import EE from 'eventemitter3'

export interface Hease<T extends number | number[]> {
    // [props: string]: any;
    onComplete: (callback: Function) => this;
    onUpdate: (callback: EasingUpdateFunc<T>) => this;
    update: (progress: number) => void;
    play: () => this
    complete: () => this
    stop: () => this
}


class _Hease extends EE {
    constructor(public config: any) {
        super();
    }

    /**
     * 起始状态
     */
    from() {

    }

    /**
     * 目标状态
     */
    to() {

    }

    /**
     * 缓动函数
     */
    ease() {

    }

    /**
     * 动画时长
     */
    duration() {

    }

    /**
     * 循环次数
     */
    repeat() {

    }

    /**
     * 播放动画
     */
    play() {

    }

    /**
     * 暂停动画（时间暂停）
     */
    pause() {

    }

    /**
     * 停止动画，不会触发complete
     */
    stop() {

    }

    /**
     * 立即完成动画
     */
    complete() {

    }

    /**
     * 更新
     */
    update() {

    }
}

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
         */
        update: (progress: number) => {

            const data = new Array<number>(len * 2);

            if (progress === 1) {
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
         * @param boolean sys 是否继续后续流程
         */
        complete: () => {
            actions.update(1);
            actions.stop();
            completeCallback && completeCallback();
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