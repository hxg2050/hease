import { hease } from '../src/index';
const ani = hease(0, 1);
ani.onComplete(() => {
    console.log('complate');
}).onUpdate(val => {
    console.log('update', val);
});
setTimeout(() => {
    console.log('stop');
    ani.complete();
}, 1000);
setTimeout(() => {
    ani.play();
}, 2000);
console.log(ani.play());