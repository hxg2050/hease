# hease

> 一个超级精简的缓动库  

[![publish](https://github.com/hxg2050/hease/actions/workflows/publish.yml/badge.svg)](https://github.com/hxg2050/hease/actions/workflows/publish.yml)
[![npm-downloads](https://img.shields.io/npm/dm/hease.svg)](https://www.npmjs.com/package/hease)
[![npm-version](https://img.shields.io/npm/v/hease.svg)](https://www.npmjs.com/package/hease)  
内置缓动函数速查表请参考: [https://easings.net/zh-cn](https://easings.net/zh-cn)

## 安装
```sh
npm install hease
```
## 例子
```ts
import { hease, EASE } from 'hease';
// 播放，并注册相关事件
const ani = hease(0, 1, 2000, EASE.linear)
    .onUpdate((val) => {
        console.log(val);
    })
    .onComplate(() => {
        console.log('动画播放完成');
    })
    .play();
// 停止动画
ani.stop();
// 立即完成动画
ani.complete();
```
### 如何播放无数次动画？
```ts
// ...
// 只需要在播放数传入Infinity
ani.play(Infinity)
// ...
```

### 如何创建一个yoyo动画？
```ts
// 回收时按照时间正向播放
const ani = hease(0, 1, 2000, EASE.linear);
```
```ts
// 回收时按照时间回溯播放
const ani = hease(0, 1, 2000, EASE.linear);

```
`注意`:时间正向和时间回溯的动画效果时不一样的  
`注意：`无限播放动画将无法触发`onComplete`，但是可以通过手动调用`complete`方法触发

## 相关API补充
``hease(from: number|number[], to: number|number[], duration = 1000, ease = EASE.linear)``  
创建一个缓动器  
``Hease.play()``  
直接播放1次动画，或者继续播放动画  
``Hease.play(num: number)``  
播放num次动画  
``bindTicker(fn: HeaseTicker)``  
绑定自定义刷新器  
``createUpdate(fn: (dt: number) => void)``  
创建一个刷新运行对象