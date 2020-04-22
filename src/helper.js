import anime from "animejs";

export const animateLinesToTarget = (elementsQuery, targetElQuery = '.js-player-tab.active', direction = 'normal') => {
    const duration = 700;
    const animElements = [...document.querySelectorAll(elementsQuery)];
    if (animElements.length < 1) return;

    let path;
    animElements.forEach((animEl, i) => {
        const delay = i * 200;

        const elRect = animEl.getBoundingClientRect();
        const elHeight = elRect.bottom - elRect.top;
        const elWidth = elRect.right - elRect.left;

        const targetElRect = document.querySelector(targetElQuery).getBoundingClientRect();
        const targetCenterX = targetElRect.right - ((targetElRect.right - targetElRect.left) / 2);
        const targetCenterY = targetElRect.bottom - ((targetElRect.bottom - targetElRect.top) / 2);

        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.querySelector('.svg-container')
        const line = document.createElementNS(svgNS, 'path');
        line.setAttribute('d', `M ${elRect.left} ${elRect.top} L ${targetCenterX - elWidth / 2} ${targetCenterY - elHeight / 2}`);
        // line.setAttribute('stroke', 'black')
        line.setAttribute('id', `myLine${i}`)

        const animElClone = animEl.cloneNode();

        if (elementsQuery === '.js-revealed') animEl.style.visibility = 'hidden';

        animElClone.style = `position: fixed; top: 0; left: 0; height: ${elHeight}px; width: ${elWidth}px`;
        animElClone.setAttribute('id', `animElClone${i}`)
        document.body.insertBefore(animElClone, svg)
        svg.appendChild(line);

        path = anime.path(`#myLine${i}`);
        anime({
            targets: `#animElClone${i}`,
            translateX: path('x'),
            translateY: path('y'),
            rotate: 560,
            scale: '.3',
            easing: 'easeInQuart', // adjust
            duration,
            delay: i * 200,
            direction,
        });
        setTimeout(() => {
            line.remove();
            animElClone.remove();
        }, duration + delay)
    })
}

