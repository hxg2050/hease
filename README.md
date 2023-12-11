```sh
npm install hease
```

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