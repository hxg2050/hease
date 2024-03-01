import { EASE, hease, yoyo } from '../src/index';

const block = document.querySelector<HTMLDivElement>('#block')!;
const playBtn = document.querySelector<HTMLDivElement>('#btn')!;
const stopBtn = document.querySelector<HTMLDivElement>('#stop')!;
const completeBtn = document.querySelector<HTMLDivElement>('#complete')!;
const eases = document.querySelector<HTMLSelectElement>('#eases')!;
const yoyoInput = document.querySelector<HTMLInputElement>('#yoyo')!;
const loopInput = document.querySelector<HTMLInputElement>('#loop')!;

const easeVlaues = Object.values(EASE);
for (let i = 0; i < easeVlaues.length; i++) {
    const ease = easeVlaues[i];
    const option = document.createElement('option');
    option.value = ease.name;
    option.innerText = ease.name;
    option.attributes['index'] = i;
    eases.append(option);
}

const createAnimation = () => {

    let ani;
    let first = true;
    const init = () => {
        first = true;
        if (ani) {
            ani.stop();
        }
        ani = hease(0, 500, 2000, yoyoInput.checked ? yoyo(EASE[eases.value]) : EASE[eases.value])
            .onComplete(() => {
                console.log('complate');
            }).onUpdate(val => {
                block.style.marginLeft = val + 'px';
            });
    }
    init();

    eases.addEventListener('change', init);
    yoyoInput.addEventListener('change', init);
    loopInput.addEventListener('change', init);

    return {
        get: () => ani,
        play: () => {
            first ? ani.play(loopInput.checked ? Infinity : 1) : ani.play();
            first = false;
        }
    };
}

let ani = createAnimation();

playBtn.addEventListener('click', () => {
    ani.play();
});
stopBtn.addEventListener('click', () => {
    ani.get().stop();
});
completeBtn.addEventListener('click', () => {
    ani.get().complete();
});